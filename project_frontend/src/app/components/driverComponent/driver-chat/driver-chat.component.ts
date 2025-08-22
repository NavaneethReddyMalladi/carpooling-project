import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DriverChatService, ChatSession, Message } from '../../../services/driverchat.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-chat',
  templateUrl: './driver-chat.component.html',
  styleUrls: ['./driver-chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class DriverChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatMessages') chatMessagesContainer!: ElementRef;
  
  chatSessions: ChatSession[] = [];
  activeChatSession: ChatSession | null = null;
  newMessage = '';
  isSendingMessage = false;
  isLoadingChats = false;
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private lastMessageCount = 0;
  private initializationComplete = false;

  constructor(
    private chatService: DriverChatService,
    public driverService: DriverService
  ) {}

  async ngOnInit() {
    try {
      console.log('DriverChatComponent initializing...');
      
      // Check if sessions are already loaded, if not load them
      if (!this.chatService.isSessionsInitialized()) {
        const sessions = await this.chatService.loadChatSessions();
        console.log('Sessions loaded in component:', sessions.length);
        
        // Auto-select first session if available and none is active
        if (sessions.length > 0 && !this.activeChatSession) {
          console.log('Auto-selecting first session:', sessions[0].rider_name);
          this.selectChatSession(sessions[0]);
        }
      } else {
        const existingSessions = this.chatService.getChatSessionsSync();
        this.chatSessions = existingSessions;
        if (existingSessions.length > 0 && !this.activeChatSession) {
          this.selectChatSession(existingSessions[0]);
        }
      }

      this.setupSubscriptions();
      
      const riderInfo = this.chatService.getActiveChatRider();
      if (riderInfo) {
        console.log("Chatting with:", riderInfo.riderName);
      }

      this.initializationComplete = true;
    } catch (error) {
      console.error('Failed to initialize driver chat component:', error);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.chatService.clearActiveSession();
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.chatService.chatSessions$.pipe(
        debounceTime(100) 
      ).subscribe(sessions => {
        const previousCount = this.chatSessions.length;
        this.chatSessions = sessions;
        
        console.log(`Sessions updated: ${sessions.length} sessions available`);
        
     
        if (this.initializationComplete && !this.activeChatSession && sessions.length > 0 && 
            !this.isLoadingChats && previousCount === 0) {
          console.log('Auto-selecting first session from subscription:', sessions[0].rider_name);
          this.selectChatSession(sessions[0]);
        }
      })
    );

    this.subscriptions.push(
      this.chatService.activeChatSession$.subscribe(session => {
        const previousMessageCount = this.lastMessageCount;
        
        if (session && session.ride_id !== this.activeChatSession?.ride_id) {
          console.log('Active session changed to:', session.ride_id);
          this.activeChatSession = session;
          
          const currentMessageCount = session.messages?.length || 0;
          if (currentMessageCount > previousMessageCount) {
            this.shouldScrollToBottom = true;
          }
          this.lastMessageCount = currentMessageCount;
        } else if (!session) {
          this.activeChatSession = null;
          this.lastMessageCount = 0;
        }
      })
    );

    this.subscriptions.push(
      this.chatService.isLoadingSessions$.subscribe(isLoading => {
        this.isLoadingChats = isLoading;
      })
    );

    this.subscriptions.push(
      this.chatService.isSendingMessage$.subscribe(flag => {
        this.isSendingMessage = flag;
      })
    );
  }

  selectChatSession(session: ChatSession) {
    if (this.activeChatSession?.ride_id === session.ride_id) {
      console.log('Session already active, skipping selection');
      return;
    }
    
    console.log('Selecting chat session:', session.ride_id);
    this.chatService.selectChatSession(session);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeChatSession || this.isSendingMessage) {
      return;
    }

    const messageText = this.newMessage.trim();
    
    this.newMessage = '';
    
    this.chatService.sendMessage(messageText).subscribe({
      next: () => {
        this.shouldScrollToBottom = true;
        console.log('Message sent successfully');
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        // Restore message text on error
        this.newMessage = messageText;
      }
    });
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return this.chatService.isMessageFromCurrentUser(message);
  }

  private scrollToBottom() {
    try {
      if (this.chatMessagesContainer?.nativeElement) {
        const element = this.chatMessagesContainer.nativeElement;
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 0);
      }
    } catch (err) {
      console.warn('Failed to scroll to bottom:', err);
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearActiveSession() {
    this.chatService.clearActiveSession();
  }

  // Helper method to track chat sessions by ID for better performance
  trackByRideId(index: number, item: ChatSession): number { 
    return item.ride_id; 
  }

  // Helper method to track messages by ID for better performance
  trackByMessageId(index: number, item: Message): number { 
    return item.message_id; 
  }

  formatMessageTime(sentAt: string): string {
    try {
      const date = new Date(sentAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  }

  hasMessages(session: ChatSession): boolean {
    return session.messages && session.messages.length > 0;
  }

  // Helper method to check if we have active sessions
  hasActiveSessions(): boolean {
    return this.chatSessions.length > 0;
  }

  // Helper method to get session status text
  getSessionStatusText(): string {
    if (this.isLoadingChats) {
      return 'Loading chat sessions...';
    }
    if (this.chatSessions.length === 0) {
      return 'No active chats available';
    }
    if (!this.activeChatSession) {
      return 'Select a chat to start messaging';
    }
    return '';
  }

  // Method to refresh chat sessions if needed
  async refreshSessions() {
    console.log('Refreshing driver chat sessions...');
    try {
      const sessions = await this.chatService.refreshChatSessions();
      console.log('Sessions refreshed:', sessions.length);
      if (sessions.length > 0 && !this.activeChatSession) {
        this.selectChatSession(sessions[0]);
      }
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
    }
  }

  // Method to manually load sessions (useful for debugging)
  async loadSessions() {
    console.log('Manually loading driver sessions...');
    try {
      const sessions = await this.chatService.loadChatSessions(true);
      console.log('Sessions loaded manually:', sessions.length);
      if (sessions.length > 0) {
        this.selectChatSession(sessions[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions manually:', error);
    }
  }
}