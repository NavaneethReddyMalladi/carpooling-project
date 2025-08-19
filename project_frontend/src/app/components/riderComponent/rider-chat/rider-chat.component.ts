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

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private riderService: RiderService
  ) {}

  ngOnInit() {
    this.chatService.loadChatSessions();
    this.setupSubscriptions();
    // this.chatService.startChatPolling();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // this.chatService.stopChatPolling();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.chatService.chatSessions$.subscribe(sessions => {
        this.chatSessions = sessions;
        // Auto-select first session if none selected
        if (!this.activeChatSession && sessions.length > 0) {
          this.selectChatSession(sessions[0]);
        }
      })
    );

    this.subscriptions.push(
      this.chatService.activeChatSession$.subscribe(session => {
        this.activeChatSession = session;
        if (session) this.shouldScrollToBottom = true;
      })
    );

    this.subscriptions.push(
      this.chatService.isSendingMessage$.subscribe(sending => {
        this.isSendingMessage = sending;
      })
    );
  }

  selectChatSession(session: ChatSession) {
    this.chatService.selectChatSession(session);
  }
  sendMessage() {
    if (!this.newMessage.trim()) return;
    if (!this.activeChatSession) {
      console.error('No active chat session selected');
      return;
    }
  
    const payload = {
      sender_id: parseInt(this.riderService.riderDetails?.rider_id || '0'),
      receiver_id: this.activeChatSession.driver_id,       // must exist
      ride_id: this.activeChatSession.ride_id,             // must exist
      message_text: this.newMessage.trim()
    };
  
    this.newMessage = '';
  
    this.chatService.sendMessage(payload).subscribe({
      next: () => this.shouldScrollToBottom = true,
      error: (err) => {
        console.error('Failed to send message:', err);
        this.newMessage = payload.message_text; // restore text
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
    if (this.chatMessagesContainer?.nativeElement) {
      const el = this.chatMessagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
