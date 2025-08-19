import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DriverService } from './driver.service';

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  ride_id?: number;
  message_text: string;
  sent_at: string;
}

export interface ChatSession {
  rider_id: number;
  rider_name: string;
  driver_id?: number;
  driver_name?: string;
  ride_id: number;
  request_status?: string;
  pickup_location?: string;
  dropoff_location?: string;
  scheduled_time?: string;
  messages: Message[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class DriverChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private activeChatSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  private isSendingMessageSubject = new BehaviorSubject<boolean>(false);

  chatSessions$ = this.chatSessionsSubject.asObservable();
  activeChatSession$ = this.activeChatSessionSubject.asObservable();
  isSendingMessage$ = this.isSendingMessageSubject.asObservable();

  private activeChatRider: { riderId: number; riderName: string; rideId?: number } | null = null;

  constructor(private http: HttpClient, private driverService: DriverService) {}

  get chatSessions() { return this.chatSessionsSubject.value; }
  get activeChatSession() { return this.activeChatSessionSubject.value; }
  get isSendingMessage() { return this.isSendingMessageSubject.value; }

  /** Load accepted/in-progress rides for driver and create chat sessions */
  loadChatSessions() {
    const driverId = parseInt(this.driverService.driverDetails?.driver_id || '0');
    if (!driverId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<any[]>(`${this.BASE_URL}/ride-requests/driver/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (rideRequests) => {
        const sessions = (rideRequests || [])
          .filter(r => ['accepted','in_progress','in progress'].includes((r.status || '').toLowerCase()))
          .map(r => ({
            rider_id: r.rider_id,
            rider_name: r.rider?.user_name || r.rider_name || `Rider ${r.rider_id}`,
            driver_id: r.driver_id,
            driver_name: r.driver?.user_name || r.driver_name,
            ride_id: r.ride_request_id || r.request_id!,
            request_status: r.status,
            pickup_location: r.ride?.origin_stop_id || r.pickup_location,
            dropoff_location: r.ride?.destination_stop_id || r.dropoff_location,
            scheduled_time: r.ride?.departure_time || r.scheduled_time,
            messages: [],
            isActive: false
          }));
        this.chatSessionsSubject.next(sessions);
      },
      error: (err) => console.error('Failed to load chat sessions:', err)
    });
  }

  /** Select a chat session and load messages */
  selectChatSession(session: ChatSession) {
    console.log('selecting cat session:',session)
    this.chatSessionsSubject.next(
      this.chatSessions.map(s => ({ ...s, isActive: s.ride_id === session.ride_id }))
    );
    this.activeChatSessionSubject.next({ ...session, isActive: true });
    this.loadMessages(session);
    
  }

  /** Load messages for a chat session, do not retry if 404 */
  private loadMessages(session: ChatSession) {
    const driverId = parseInt(this.driverService.driverDetails.driver_id);
    const token = localStorage.getItem('token');
    console.log('Loading messages for:', driverId, session.rider_id);

    if (!token) return;

    this.http.get<Message[]>(`${this.BASE_URL}/messages/conversation/${session.rider_id}/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (messages) => this.updateSessionMessages(session, messages),
      error: (err) => {
        if (err.status === 404) {
          this.updateSessionMessages(session, []); // No messages yet
        } else {
          console.error('Failed to load messages:', err);
        }
      }
    });
  }

  /** Update messages in session */
  private updateSessionMessages(session: ChatSession, messages: Message[]) {
    const updated = this.chatSessions.map(s => s.ride_id === session.ride_id ? { ...s, messages } : s);
    this.chatSessionsSubject.next(updated);
    if (this.activeChatSession?.ride_id === session.ride_id) {
      this.activeChatSessionSubject.next({ ...this.activeChatSession, messages });
    }
  }

  /** Send a message in the active session */
  sendMessage(messageText: string): Observable<any> {
    return new Observable(observer => {
      if (!this.activeChatSession || !messageText.trim()) {
        return observer.error('No active session or empty message');
      }

      this.isSendingMessageSubject.next(true);
      const token = localStorage.getItem('token');
      const driverId = parseInt(this.driverService.driverDetails?.driver_id || '0');
      if (!token || !driverId) return observer.error('Authentication missing');

      const messageData = {
        sender_id: driverId,
        receiver_id: this.activeChatSession.rider_id,
        ride_id: this.activeChatSession.ride_id, // ⚡ use ride_id
        message_text: messageText.trim()
      };

      this.http.post<Message>(`${this.BASE_URL}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (msg) => {
          const updatedMessages = [...(this.activeChatSession?.messages || []), msg];
          this.updateSessionMessages(this.activeChatSession!, updatedMessages);
          this.isSendingMessageSubject.next(false);
          observer.next(msg); observer.complete();
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          this.isSendingMessageSubject.next(false);
          observer.error(err);
        }
      });
    });
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === parseInt(this.driverService.driverDetails?.driver_id || '0');
  }

  clearActiveSession() {
    this.activeChatSessionSubject.next(null);
    this.chatSessionsSubject.next(this.chatSessions.map(s => ({ ...s, isActive: false })));
  }

  /** Track currently active chat rider */
  addRiderToChat(riderId: number, riderName: string, rideId?: number) {
    this.activeChatRider = { riderId, riderName, rideId };
  }

  getActiveChatRider(): { riderId: number; riderName: string; rideId?: number } | null {
    return this.activeChatRider;
  }

  clearActiveChatRider() {
    this.activeChatRider = null;
  }
}
