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
  messagesLoaded?: boolean; 
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private activeChatSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  private isSendingMessageSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSessionsSubject = new BehaviorSubject<boolean>(false);

  chatSessions$ = this.chatSessionsSubject.asObservable();
  activeChatSession$ = this.activeChatSessionSubject.asObservable();
  isSendingMessage$ = this.isSendingMessageSubject.asObservable();
  isLoadingSessions$ = this.isLoadingSessionsSubject.asObservable();

  private loadedSessions = new Set<number>(); 
  private isInitialized = false;
  private loadingPromise: Promise<ChatSession[]> | null = null; 

  constructor(private http: HttpClient, private riderService: RiderService) {}

  get chatSessions() { return this.chatSessionsSubject.value; }
  get activeChatSession() { return this.activeChatSessionSubject.value; }
  get isSendingMessage() { return this.isSendingMessageSubject.value; }
  get isLoadingSessions() { return this.isLoadingSessionsSubject.value; }

  loadChatSessions(): Promise<ChatSession[]> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    if (this.isInitialized) {
      return Promise.resolve(this.chatSessions);
    }

    const riderId = parseInt(this.riderService.riderDetails?.rider_id || '0');
    if (!riderId) {
      console.warn('No rider ID available');
      return Promise.resolve([]);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token available');
      return Promise.resolve([]);
    }

    this.isLoadingSessionsSubject.next(true);

    this.loadingPromise = new Promise((resolve, reject) => {
      this.http.get<any[]>(`${this.BASE_URL}/ride-requests/rider/${riderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (requests) => {
          const sessions = requests
            .filter(r => ['accepted', 'in_progress'].includes((r.status || '').toLowerCase()))
            .map(r => ({
              driver_id: r.driver?.driver_id,
              driver_name: r.driver?.driver_name || `Driver ${r.driver?.driver_id}`,
              rider_id: r.rider_id,
              rider_name: r.rider_name,
              ride_request_id: r.request_id,
              ride_id: r.ride_id,
              request_status: r.status,
              pickup_location: r.pickup_location,
              dropoff_location: r.dropoff_location,
              scheduled_time: r.scheduled_time,
              messages: [],
              isActive: false,
              messagesLoaded: false
            } as ChatSession));

          this.chatSessionsSubject.next(sessions);
          this.isInitialized = true;
          this.isLoadingSessionsSubject.next(false);
          this.loadingPromise = null;
          
          console.log("Chat sessions loaded:", sessions.length);
          resolve(sessions);
        },
        error: (err) => {
          console.error('Failed to load chat sessions:', err);
          this.isLoadingSessionsSubject.next(false);
          this.loadingPromise = null;
          reject(err);
        }
      });
    });

    return this.loadingPromise;
  }

  selectChatSession(session: ChatSession) {
    if (this.activeChatSession?.ride_request_id === session.ride_request_id) {
      return;
    }

    const updatedSessions = this.chatSessions.map(s => ({ 
      ...s, 
      isActive: s.ride_request_id === session.ride_request_id 
    }));
    
    this.chatSessionsSubject.next(updatedSessions);
    this.activeChatSessionSubject.next({ ...session, isActive: true });
    
    if (!session.messagesLoaded && !this.loadedSessions.has(session.ride_request_id)) {
      this.loadMessages(session);
    }
  }

  private loadMessages(session: ChatSession) {
    const riderId = parseInt(this.riderService.riderDetails?.rider_id || '0');
    const token = localStorage.getItem('token');

    if (!riderId || !token) {
      console.warn('Cannot load messages: missing rider ID or token');
      return;
    }

    this.loadedSessions.add(session.ride_request_id);

    this.http.get<Message[]>(`${this.BASE_URL}/messages/conversation/${riderId}/${session.driver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (messages) => {
        this.updateSessionMessages(session, messages, true);
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        this.updateSessionMessages(session, [], true); 
      }
    });
  }

  private updateSessionMessages(session: ChatSession, messages: Message[], markAsLoaded = false) {
    const updated = this.chatSessions.map(s =>
      s.ride_request_id === session.ride_request_id 
        ? { ...s, messages, messagesLoaded: markAsLoaded || s.messagesLoaded } 
        : s
    );
    
    this.chatSessionsSubject.next(updated);

    if (this.activeChatSession?.ride_request_id === session.ride_request_id) {
      this.activeChatSessionSubject.next({ 
        ...this.activeChatSession, 
        messages,
        messagesLoaded: markAsLoaded || this.activeChatSession.messagesLoaded
      });
    }
  }

  sendMessage(messageData: { sender_id: number, receiver_id: number, ride_id: number, message_text: string }): Observable<any> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      if (!token) {
        observer.error('Authentication missing');
        return;
      }

      if (this.isSendingMessage) {
        observer.error('Already sending a message');
        return;
      }
  
      this.isSendingMessageSubject.next(true); 
  
      this.http.post<Message>(`${this.BASE_URL}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (msg) => {
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

  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === parseInt(this.riderService.riderDetails?.rider_id || '0');
  }

  clearActiveSession() {
    this.activeChatSessionSubject.next(null);
    this.chatSessionsSubject.next(this.chatSessions.map(s => ({ ...s, isActive: false })));
  }

  addDriverToChat(riderId: number, driverIdOrName: string | number, rideRequestId?: number) {
    const session = {
      rider_id: riderId,
      driver_id: driverIdOrName,
      ride_request_id: rideRequestId
    };
    return this.http.post<any>(`${this.BASE_URL}/create-chat-session`, session);
  }

  reset() {
    this.isInitialized = false;
    this.loadedSessions.clear();
    this.loadingPromise = null;
    this.chatSessionsSubject.next([]);
    this.activeChatSessionSubject.next(null);
    this.isSendingMessageSubject.next(false);
    this.isLoadingSessionsSubject.next(false);
  }

  refresh(): Promise<ChatSession[]> {
    this.reset();
    return this.loadChatSessions();
  }

  isInitialized_(): boolean {
    return this.isInitialized;
  }
}