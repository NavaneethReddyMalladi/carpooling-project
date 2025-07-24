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
  addRiderToChat(riderId: number, riderName: string, rideId: number | undefined) {
    throw new Error('Method not implemented.');
  }
  @ViewChild('chatMessages') chatMessagesContainer!: ElementRef;

  chatSessions: ChatSession[] = [];
  activeChatSession: ChatSession | null = null;
  newMessage = '';
  isSendingMessage = false;
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: DriverChatService,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.loadChatData();
    this.setupSubscriptions();
    this.chatService.startChatPolling();
  }

  ngOnDestroy() {
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
    this.chatService.loadChatSessions();
  }

  private setupSubscriptions() {
    // Subscribe to chat sessions
    this.subscriptions.push(
      this.chatService.chatSessions$.subscribe(sessions => {
        this.chatSessions = sessions;
      })
    );

    // Subscribe to active chat session
    this.subscriptions.push(
      this.chatService.activeChatSession$.subscribe(session => {
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
    this.chatService.selectChatSession(session);
  }

  // Send a message
  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = this.newMessage;
    this.newMessage = '';

    this.chatService.sendMessage(message).subscribe({
      next: () => {
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
    return this.driverService.formatMessageTime(dateString);
  }

  // Scroll chat to bottom
  private scrollToBottom() {
    if (this.chatMessagesContainer?.nativeElement) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  // Handle Enter key in input
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}




// currentUser	{"id":4,"email":"dmittu@gmail.com","role":"Driver"}
// riderDetails	{"rider_id":3,"rider_name":"rnavaneeth","gender":"Other","phone_number":"9908213185","start_stop_id":"","destination_stop_id":"","email":"rnavaneeth@gmail.com","is_verified":false,"role_id":2,"create_datetime":"Mon, 02 Jun 2025 06:28:37 GMT","driver_id":null}
// role_id	1
// role_name	Driver
// token	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MzM2MzA0OCwianRpIjoiODZiZGExYzMtZWM1Yy00MzE5LWE5YjQtMTU2M2IwYjI4YWY1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJ1c2VyX2lkIjo0LCJyb2xlX25hbWUiOiJEcml2ZXIifSwibmJmIjoxNzUzMzYzMDQ4LCJjc3JmIjoiMmIzOTZmMDYtZThmMC00NzEzLWJmODYtMmUwMGI5YjU5YmJkIiwiZXhwIjoxNzUzMzYzOTQ4fQ.GoDB9cHALo_QQ1gE1_cgbNA1HzKePH6RBsQ7wAd2si4
// user_id	4
