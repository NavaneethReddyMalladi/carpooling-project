import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverChatService, ChatSession, Message } from '../../../services/driverchat.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-chat',
  templateUrl: './driver-chat.component.html',
  styleUrls: ['./driver-chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DriverChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') chatMessagesContainer!: ElementRef;

  chatSessions: ChatSession[] = [];
  activeChatSession: ChatSession | null = null;
  newMessage = '';
  isSendingMessage = false;
  isLoadingChats = true;
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: DriverChatService,
    public driverService: DriverService
  ) {
    console.log('DriverChatComponent constructor called');
  }

  ngOnInit() {
    console.log('DriverChatComponent ngOnInit called');
    console.log('Driver details:', this.driverService.driverDetails);
    
    this.setupSubscriptions();
    this.loadChatData();
    this.chatService.startChatPolling();

    const riderInfo = this.chatService.getActiveChatRider();
    if (riderInfo) {
      console.log("Chatting with:", riderInfo.riderName);
    } else {
      console.log("No specific rider selected for chat.");
    }
  }

  ngOnDestroy() {
    console.log('DriverChatComponent ngOnDestroy called');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.stopChatPolling();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private loadChatData() {
    console.log('Loading chat data...');
    this.isLoadingChats = true;
    
    // Add a small delay to ensure driver details are available
    setTimeout(() => {
      this.chatService.loadChatSessions();
    }, 100);
  }

  private setupSubscriptions() {
    console.log('Setting up subscriptions...');
    
    // Subscribe to chat sessions
    this.subscriptions.push(
      this.chatService.chatSessions$.subscribe(sessions => {
        console.log('Chat sessions updated:', sessions);
        this.chatSessions = sessions;
        this.isLoadingChats = false;
        
        // Auto-select first session if none is active and we have sessions
        if (sessions.length > 0 && !this.activeChatSession) {
          console.log('Auto-selecting first session');
          this.selectChatSession(sessions[0]);
        }
      })
    );

    // Subscribe to active chat session
    this.subscriptions.push(
      this.chatService.activeChatSession$.subscribe(session => {
        console.log('Active chat session updated:', session);
        this.activeChatSession = session;
        if (session) {
          this.shouldScrollToBottom = true;
        }
      })
    );

    // Subscribe to sending message state
    this.subscriptions.push(
      this.chatService.isSendingMessage$.subscribe(sending => {
        this.isSendingMessage = sending;
      })
    );
  }

  // Select a chat session
  selectChatSession(session: ChatSession) {
    console.log('Selecting chat session:', session);
    this.chatService.selectChatSession(session);
  }

  // Send a message
  sendMessage() {
    if (!this.newMessage.trim()) {
      console.log('Empty message, not sending');
      return;
    }

    const message = this.newMessage;
    this.newMessage = '';

    console.log('Sending message:', message);

    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        // Restore message if sending failed
        this.newMessage = message;
      }
    });
  }

  // Check if message is from current user
  isMessageFromCurrentUser(message: Message): boolean {
    return this.chatService.isMessageFromCurrentUser(message);
  }

  // Format message time
  formatMessageTime(dateString: string): string {
    try {
      if (this.driverService.formatMessageTime) {
        return this.driverService.formatMessageTime(dateString);
      }
      // Fallback formatting
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting message time:', error);
      return 'Invalid time';
    }
  }

  // Format ride request time for display
  formatRideTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting ride time:', error);
      return 'Invalid date';
    }
  }

  // Get status display text and color
  getStatusDisplay(session: ChatSession): { text: string, class: string } {
    const status = session.request_status?.toLowerCase();
    switch (status) {
      case 'accepted':
        return { text: 'Ride Accepted', class: 'status-accepted' };
      case 'in_progress':
      case 'in progress':
        return { text: 'In Progress', class: 'status-in-progress' };
      default:
        return { text: session.request_status || 'Unknown', class: 'status-other' };
    }
  }

  // Get ride location summary
  getLocationSummary(session: ChatSession): string {
    try {
      const pickup = session.pickup_location || 'Unknown pickup';
      const dropoff = session.dropoff_location || 'Unknown destination';
      
      // Extract city names or first part before comma
      const pickupShort = pickup.split(',')[0].trim();
      const dropoffShort = dropoff.split(',')[0].trim();
      
      return `${pickupShort} → ${dropoffShort}`;
    } catch (error) {
      console.error('Error creating location summary:', error);
      return 'Unknown route';
    }
  }

  // Scroll chat to bottom
  private scrollToBottom() {
    try {
      if (this.chatMessagesContainer?.nativeElement) {
        const container = this.chatMessagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  // Handle Enter key in input
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Refresh chat sessions manually
  refreshChats() {
    console.log('Manually refreshing chats...');
    this.isLoadingChats = true;
    this.chatService.refreshChatSessions();
  }

  // Get session status helper for service
  getSessionStatusText(session: ChatSession): string {
    return this.chatService.getSessionStatusText(session);
  }

  // Check if session has unread messages (placeholder for future enhancement)
  hasUnreadMessages(session: ChatSession): boolean {
    // For now, return false. You can implement unread message tracking later
    return false;
  }

  // Get time since last message
  getTimeSinceLastMessage(session: ChatSession): string {
    try {
      if (!session.messages || session.messages.length === 0) return '';
      
      const lastMessage = session.messages[session.messages.length - 1];
      const now = new Date();
      const messageTime = new Date(lastMessage.sent_at);
      const diffMs = now.getTime() - messageTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (error) {
      console.error('Error calculating time since last message:', error);
      return '';
    }
  }

  // Helper method to set quick message
  setQuickMessage(message: string) {
    this.newMessage = message;
  }

  // Debug helper to log current state
  debugCurrentState() {
    console.log('=== Debug Current State ===');
    console.log('Chat Sessions:', this.chatSessions);
    console.log('Active Chat Session:', this.activeChatSession);
    console.log('Is Loading Chats:', this.isLoadingChats);
    console.log('Driver Details:', this.driverService.driverDetails);
    console.log('=========================');
  }

  // Track by functions for performance
  trackByRideRequestId(index: number, item: ChatSession): number {
    return item.ride_request_id;
  }

  trackByMessageId(index: number, item: Message): number {
    return item.message_id;
  }
}