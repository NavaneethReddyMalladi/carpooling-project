import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverChatService, ChatSession, Message } from '../../../services/driverchat.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-chat',
  templateUrl: './driver-chat.component.html',
  styleUrls: ['./driver-chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule]
})
export class DriverChatComponent implements OnInit, AfterViewChecked {
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
  ) {}

  ngOnInit() {
    this.setupSubscriptions();
    this.chatService.loadChatSessions(); // Load all sessions once

    const riderInfo = this.chatService.getActiveChatRider();
    if (riderInfo) console.log("Chatting with:", riderInfo.riderName);
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
        this.isLoadingChats = false;
        if (sessions.length > 0 && !this.activeChatSession) {
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
      this.chatService.isSendingMessage$.subscribe(flag => this.isSendingMessage = flag)
    );
  }

  selectChatSession(session: ChatSession) {
    this.chatService.selectChatSession(session);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeChatSession) return;

    const text = this.newMessage;
    this.newMessage = '';

    this.chatService.sendMessage(text).subscribe({
      next: () => this.shouldScrollToBottom = true,
      error: (err) => {
        console.error('Failed to send message:', err);
        this.newMessage = text;
      }
    });
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return this.chatService.isMessageFromCurrentUser(message);
  }

  scrollToBottom() {
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

  clearActiveSession() {
    this.chatService.clearActiveSession();
  }

  // trackByRideRequestId(index: number, item: ChatSession): number { return item.ride_request_id; }
  trackByMessageId(index: number, item: Message): number { return item.message_id; }
}
