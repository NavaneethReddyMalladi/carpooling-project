import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatSession, Message } from '../../../services/riderchat.service';
import { RiderService } from '../../../services/rider.service';

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
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private riderService: RiderService
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
    return this.riderService.formatMessageTime(dateString);
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