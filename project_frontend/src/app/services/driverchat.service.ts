import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap, debounceTime } from 'rxjs/operators';
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
  ride_request_id?: number; 
  request_status?: string;
  pickup_location?: string;
  dropoff_location?: string;
  scheduled_time?: string;
  messages: Message[];
  isActive: boolean;
  messagesLoaded?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DriverChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private activeChatSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  private isSendingMessageSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSessionsSubject = new BehaviorSubject<boolean>(false);

  chatSessions$ = this.chatSessionsSubject.asObservable();
  activeChatSession$ = this.activeChatSessionSubject.asObservable();
  isSendingMessage$ = this.isSendingMessageSubject.asObservable();
  isLoadingSessions$ = this.isLoadingSessionsSubject.asObservable();

  private activeChatRider: { riderId: number; riderName: string; rideId?: number } | null = null;
  private loadedSessions = new Set<number>(); // Track loaded sessions by ride_id
  private isInitialized = false;
  private loadingPromise: Promise<ChatSession[]> | null = null; // Prevent concurrent loads

  constructor(private http: HttpClient, private driverService: DriverService) {}

  get chatSessions() { return this.chatSessionsSubject.value; }
  get activeChatSession() { return this.activeChatSessionSubject.value; }
  get isSendingMessage() { return this.isSendingMessageSubject.value; }
  get isLoadingSessions() { return this.isLoadingSessionsSubject.value; }

  /** Get user ID from JWT token */
  private getCurrentUserId(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let userId: any;
      if (payload.sub && typeof payload.sub === 'object' && payload.sub.user_id) {
        userId = payload.sub.user_id;
      } else if (payload.user_id) {
        userId = payload.user_id;
      } else if (payload.sub && typeof payload.sub !== 'object') {
        userId = payload.sub;
      } else if (payload.id) {
        userId = payload.id;
      } else {
        return 0;
      }
      
      return typeof userId === 'string' ? parseInt(userId) : Number(userId) || 0;
    } catch (error) {
      console.error('Error decoding token:', error);
      return 0;
    }
  }

  /** Load accepted/in-progress rides for driver and create chat sessions - only once */
  loadChatSessions(forceReload = false): Promise<ChatSession[]> {
    // Return existing promise if already loading
    if (this.loadingPromise && !forceReload) {
      return this.loadingPromise;
    }

    // Return existing sessions if already initialized and not forcing reload
    if (this.isInitialized && !forceReload) {
      return Promise.resolve(this.chatSessions);
    }

    const driverId = this.getCurrentUserId();
    if (!driverId) {
      console.warn('No valid driver ID found');
      return Promise.resolve([]);
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token available');
      return Promise.resolve([]);
    }

    this.isLoadingSessionsSubject.next(true);

    this.loadingPromise = new Promise((resolve, reject) => {
      console.log('Loading chat sessions for driver ID:', driverId);

      this.http.get<any[]>(`${this.BASE_URL}/ride-requests/driver/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        catchError(err => {
          console.error('Failed to load chat sessions:', err);
          return of([]); // Return empty array on error
        }),
        finalize(() => {
          this.isLoadingSessionsSubject.next(false);
          this.isInitialized = true;
          this.loadingPromise = null;
        })
      ).subscribe({
        next: (rideRequests) => {
          const sessions = (rideRequests || [])
            .filter(r => ['accepted','in_progress','in progress'].includes((r.status || '').toLowerCase()))
            .map(r => ({
              rider_id: r.rider_id,
              rider_name: r.rider?.user_name || r.rider_name || `Rider ${r.rider_id}`,
              driver_id: this.getCurrentUserId(),
              ride_id: r.ride_request_id || r.request_id,
              ride_request_id: r.request_id,
              request_status: r.status,
              pickup_location: r.ride?.origin_stop_id || r.pickup_location,
              dropoff_location: r.ride?.destination_stop_id || r.dropoff_location,
              scheduled_time: r.ride?.departure_time || r.scheduled_time,
              messages: [],
              isActive: false,
              messagesLoaded: false
            } as ChatSession));
          
          this.chatSessionsSubject.next(sessions);
          console.log(`Chat sessions loaded: ${sessions.length} sessions`);
          resolve(sessions);
        },
        error: (err) => {
          console.error('Failed to load chat sessions:', err);
          this.chatSessionsSubject.next([]);
          reject(err);
        }
      });
    });

    return this.loadingPromise;
  }

  /** Select a chat session and load messages only if not already loaded */
  selectChatSession(session: ChatSession) {
    // Prevent unnecessary updates if same session is already active
    if (this.activeChatSession?.ride_id === session.ride_id) {
      return;
    }

    console.log('Selecting chat session:', session.ride_id);
    
    // Update active status in sessions array
    const updatedSessions = this.chatSessions.map(s => ({ 
      ...s, 
      isActive: s.ride_id === session.ride_id 
    }));
    this.chatSessionsSubject.next(updatedSessions);
    
    // Set active session
    const activeSession = { ...session, isActive: true };
    this.activeChatSessionSubject.next(activeSession);
    
    // Load messages only if not already loaded
    if (!session.messagesLoaded && !this.loadedSessions.has(session.ride_id)) {
      this.loadMessages(activeSession);
    }
  }

  /** Load messages for a chat session only once */
  private loadMessages(session: ChatSession) {
    const driverId = this.getCurrentUserId();
    const token = localStorage.getItem('token');
    
    if (!token || !driverId) {
      console.warn('Cannot load messages: missing token or driver ID');
      return;
    }

    // Mark as being loaded to prevent duplicate calls
    this.loadedSessions.add(session.ride_id);

    const url = `${this.BASE_URL}/messages/conversation/${session.rider_id}/${driverId}`;
    console.log('Loading messages from:', url);

    this.http.get<Message[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        if (err.status === 404) {
          console.log(`No messages found for session ${session.ride_id} - creating empty conversation`);
          return of([]);
        } else {
          console.error('Failed to load messages:', err);
          return of([]);
        }
      })
    ).subscribe({
      next: (messages) => {
        console.log(`Loaded ${messages.length} messages for session ${session.ride_id}`);
        this.updateSessionMessages(session, messages, true);
      }
    });
  }

  /** Update messages in session */
  private updateSessionMessages(session: ChatSession, messages: Message[], markAsLoaded: boolean = false) {
    const updated = this.chatSessions.map(s => 
      s.ride_id === session.ride_id 
        ? { ...s, messages, messagesLoaded: markAsLoaded || s.messagesLoaded } 
        : s
    );
    this.chatSessionsSubject.next(updated);
    
    if (this.activeChatSession?.ride_id === session.ride_id) {
      this.activeChatSessionSubject.next({ 
        ...this.activeChatSession, 
        messages,
        messagesLoaded: markAsLoaded || this.activeChatSession.messagesLoaded
      });
    }
  }

  /** Send a message in the active session with optimistic UI update */
  sendMessage(messageText: string): Observable<any> {
    return new Observable(observer => {
      if (!this.activeChatSession || !messageText.trim() || this.isSendingMessage) {
        observer.error('Cannot send message');
        return;
      }

      const token = localStorage.getItem('token');
      const driverId = this.getCurrentUserId();
      
      if (!token || !driverId) {
        observer.error('Authentication missing');
        return;
      }

      this.isSendingMessageSubject.next(true);

      const messageData = {
        sender_id: driverId,
        receiver_id: this.activeChatSession.rider_id,
        ride_id: this.activeChatSession.ride_id,
        message_text: messageText.trim()
      };

      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        message_id: Date.now(), // Temporary ID
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        ride_id: messageData.ride_id,
        message_text: messageData.message_text,
        sent_at: new Date().toISOString()
      };

      // Add optimistic message to UI immediately
      if (this.activeChatSession) {
        const updatedMessages = [...(this.activeChatSession.messages || []), optimisticMessage];
        this.updateSessionMessages(this.activeChatSession, updatedMessages);
      }

      this.http.post<Message>(`${this.BASE_URL}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        finalize(() => this.isSendingMessageSubject.next(false))
      ).subscribe({
        next: (actualMessage) => {
          // Replace optimistic message with actual server response
          if (this.activeChatSession) {
            const messages = this.activeChatSession.messages || [];
            const updatedMessages = messages.map(msg => 
              msg.message_id === optimisticMessage.message_id ? actualMessage : msg
            );
            this.updateSessionMessages(this.activeChatSession, updatedMessages);
          }
          observer.next(actualMessage);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          // Remove optimistic message on failure
          if (this.activeChatSession) {
            const messages = this.activeChatSession.messages || [];
            const updatedMessages = messages.filter(msg => msg.message_id !== optimisticMessage.message_id);
            this.updateSessionMessages(this.activeChatSession, updatedMessages);
          }
          observer.error(err);
        }
      });
    });
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === this.getCurrentUserId();
  }

  clearActiveSession() {
    this.activeChatSessionSubject.next(null);
    const updated = this.chatSessions.map(s => ({ ...s, isActive: false }));
    this.chatSessionsSubject.next(updated);
  }

  /** Reset service state (useful for logout) */
  reset() {
    this.isInitialized = false;
    this.loadedSessions.clear();
    this.loadingPromise = null;
    this.chatSessionsSubject.next([]);
    this.activeChatSessionSubject.next(null);
    this.isSendingMessageSubject.next(false);
    this.isLoadingSessionsSubject.next(false);
    this.activeChatRider = null;
  }

  /** Force refresh chat sessions */
  refreshChatSessions(): Promise<ChatSession[]> {
    this.reset();
    return this.loadChatSessions();
  }

  /** Get sessions synchronously if already loaded */
  getChatSessionsSync(): ChatSession[] {
    return this.chatSessions;
  }

  /** Check if sessions are initialized */
  isSessionsInitialized(): boolean {
    return this.isInitialized;
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