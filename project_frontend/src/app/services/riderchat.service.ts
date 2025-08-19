import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RiderService } from './rider.service';

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  ride_id: number;
  message_text: string;
  sent_at: string;
}

export interface ChatSession {
  driver_id: number;
  driver_name: string;
  rider_id?: number;
  rider_name?: string;
  ride_request_id: number;
  request_status?: string;
  pickup_location?: string;
  dropoff_location?: string;
  scheduled_time?: string;
  ride_id: number;     
  messages: Message[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private activeChatSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  private isSendingMessageSubject = new BehaviorSubject<boolean>(false);

  chatSessions$ = this.chatSessionsSubject.asObservable();
  activeChatSession$ = this.activeChatSessionSubject.asObservable();
  isSendingMessage$ = this.isSendingMessageSubject.asObservable();

  constructor(private http: HttpClient, private riderService: RiderService) {}

  get chatSessions() { return this.chatSessionsSubject.value; }
  get activeChatSession() { return this.activeChatSessionSubject.value; }
  get isSendingMessage() { return this.isSendingMessageSubject.value; }

  /** Load rider’s active ride requests and create chat sessions */
  loadChatSessions() {
    const riderId = parseInt(this.riderService.riderDetails?.rider_id || '0');
    if (!riderId) return;

    const token = localStorage.getItem('token');
    this.http.get<any[]>(`${this.BASE_URL}/ride-requests/rider/${riderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (requests) => {
        const sessions = requests
  .filter(r => ['accepted', 'in_progress'].includes((r.status || '').toLowerCase()))
  .map(r => ({
    driver_id: r.driver?.driver_id,            // <-- use nested field
    driver_name: r.driver?.driver_name || `Driver ${r.driver?.driver_id}`,
    rider_id: r.rider_id,
    rider_name: r.rider_name,                  // optional if nested, adjust as needed
    ride_request_id: r.request_id,
    ride_id: r.ride_id,                        // include ride_id for sending messages
    messages: [],
    isActive: false
  }));

        this.chatSessionsSubject.next(sessions);
        console.log("chat sessionssssssssss, " ,sessions)
      },
      error: (err) => console.error('Failed to load chat sessions:', err)
    });
  }

  /** Select a session and load its messages once */
  selectChatSession(session: ChatSession) {
    this.chatSessionsSubject.next(
      this.chatSessions.map(s => ({ ...s, isActive: s.ride_request_id === session.ride_request_id }))
    );
    this.activeChatSessionSubject.next({ ...session, isActive: true });
    this.loadMessages(session);
  }

  /** Load messages once for a session without polling */
  private loadMessages(session: ChatSession) {
    const riderId = parseInt(this.riderService.riderDetails?.rider_id || '0');
    const token = localStorage.getItem('token');

    if (!riderId || !token) return;

    this.http.get<Message[]>(`${this.BASE_URL}/messages/conversation/${riderId}/${session.driver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (messages) => this.updateSessionMessages(session, messages),
      error: () => this.updateSessionMessages(session, []) // fallback empty
    });
  }

  /** Update session messages and active session in UI */
  private updateSessionMessages(session: ChatSession, messages: Message[]) {
    const updated = this.chatSessions.map(s =>
      s.ride_request_id === session.ride_request_id ? { ...s, messages } : s
    );
    this.chatSessionsSubject.next(updated);

    if (this.activeChatSession?.ride_request_id === session.ride_request_id) {
      this.activeChatSessionSubject.next({ ...this.activeChatSession, messages });
    }
  }

  /** Send message and immediately append to active session */
  sendMessage(messageData: { sender_id: number, receiver_id: number, ride_id: number, message_text: string }): Observable<any> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      if (!token) {
        observer.error('Authentication missing');
        return;
      }
  
      this.isSendingMessageSubject.next(true); 
  
      this.http.post<Message>(`${this.BASE_URL}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (msg) => {
          // append to active session
          if (this.activeChatSession) {
            const updatedMessages = [...(this.activeChatSession.messages || []), msg];
            this.updateSessionMessages(this.activeChatSession, updatedMessages);
          }
          this.isSendingMessageSubject.next(false);
          observer.next(msg);
          observer.complete();
        },
        error: (err) => {
          console.error('Send message failed:', err);
          this.isSendingMessageSubject.next(false);
          observer.error(err);
        }
      });
    });
  }
  

  /** Check if message is sent by current rider */
  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === parseInt(this.riderService.riderDetails?.rider_id || '0');
  }

  /** Clear active session */
  clearActiveSession() {
    this.activeChatSessionSubject.next(null);
    this.chatSessionsSubject.next(this.chatSessions.map(s => ({ ...s, isActive: false })));
  }

addDriverToChat(riderId: number, driverIdOrName: string | number, rideRequestId?: number) {
  const session = {
    rider_id: riderId,
    driver_id: driverIdOrName,   // can be number or string
    ride_request_id: rideRequestId
  };
  return this.http.post<any>(`${this.BASE_URL}/create-chat-session`, session);
}
}

