import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatSession, Message } from '../../../services/riderchat.service';
import { RiderService } from '../../../services/rider.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-rider-chat',
  templateUrl: './rider-chat.component.html',
  styleUrls: ['./rider-chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RiderChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') chatMessagesContainer!: ElementRef;

  chatSessions: ChatSession[] = [];
  activeChatSession: ChatSession | null = null;
  newMessage = '';
  isSendingMessage = false;
  isLoadingSessions = false;

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private initializationComplete = false;

  constructor(
    private chatService: ChatService,
    private riderService: RiderService
  ) {}

  async ngOnInit() {
    try {
      // Load chat sessions and wait for completion
      console.log('Loading chat sessions...');
      const sessions = await this.chatService.loadChatSessions();
      console.log('Sessions loaded in component:', sessions.length);
      
      // Setup subscriptions after initial load
      this.setupSubscriptions();
      
      // Auto-select first session if available
      if (sessions.length > 0 && !this.activeChatSession) {
        console.log('Auto-selecting first session:', sessions[0].driver_name);
        this.selectChatSession(sessions[0]);
      } else if (sessions.length === 0) {
        console.log('No active chat sessions found');
      }
      
      this.initializationComplete = true;
    } catch (error) {
      console.error('Failed to initialize chat component:', error);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private setupSubscriptions() {
    // Subscribe to chat sessions - only after initial load
    this.subscriptions.push(
      this.chatService.chatSessions$.subscribe(sessions => {
        console.log('Sessions subscription update:', sessions.length);
        this.chatSessions = sessions;
        
        // Only auto-select if initialization is complete and no active session
        if (this.initializationComplete && !this.activeChatSession && sessions.length > 0) {
          console.log('Auto-selecting session from subscription:', sessions[0].driver_name);
          this.selectChatSession(sessions[0]);
        }
      })
    );

    // Subscribe to active chat session
    this.subscriptions.push(
      this.chatService.activeChatSession$.subscribe(session => {
        console.log('Active session updated:', session ? session.driver_name : 'None');
        this.activeChatSession = session;
        if (session) {
          this.shouldScrollToBottom = true;
        }
      })
    );

    // Subscribe to sending state
    this.subscriptions.push(
      this.chatService.isSendingMessage$.subscribe(sending => {
        this.isSendingMessage = sending;
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      this.chatService.isLoadingSessions$.subscribe(loading => {
        this.isLoadingSessions = loading;
      })
    );
  }

  selectChatSession(session: ChatSession) {
    console.log('Selecting chat session:', session.driver_name);
    
    // Prevent selecting same session repeatedly
    if (this.activeChatSession?.ride_request_id === session.ride_request_id) {
      console.log('Session already active, skipping selection');
      return;
    }
    
    this.chatService.selectChatSession(session);
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isSendingMessage) {
      return;
    }
    
    if (!this.activeChatSession) {
      console.error('No active chat session selected');
      return;
    }

    const messageText = this.newMessage.trim();
    const payload = {
      sender_id: parseInt(this.riderService.riderDetails?.rider_id || '0'),
      receiver_id: this.activeChatSession.driver_id,
      ride_id: this.activeChatSession.ride_id,
      message_text: messageText
    };

    // Clear input immediately
    this.newMessage = '';

    this.chatService.sendMessage(payload).subscribe({
      next: () => {
        this.shouldScrollToBottom = true;
        console.log('Message sent successfully');
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.newMessage = messageText; // Restore message on error
      }
    });
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return this.chatService.isMessageFromCurrentUser(message);
  }

  formatMessageTime(dateString: string): string {
    return this.riderService.formatMessageTime(dateString);
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

  // Utility methods for debugging
  async refreshSessions() {
    console.log('Refreshing sessions...');
    try {
      const sessions = await this.chatService.refresh();
      console.log('Sessions refreshed:', sessions.length);
      if (sessions.length > 0 && !this.activeChatSession) {
        this.selectChatSession(sessions[0]);
      }
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
    }
  }

  // Helper method to check if we have active sessions
  hasActiveSessions(): boolean {
    return this.chatSessions.length > 0;
  }

  // Helper method to get session status text
  getSessionStatusText(): string {
    if (this.isLoadingSessions) {
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

  // Track by functions for better performance
  trackByChatSession(index: number, session: ChatSession): number {
    return session.ride_request_id;
  }

  trackByMessage(index: number, message: Message): number {
    return message.message_id;
  }
}