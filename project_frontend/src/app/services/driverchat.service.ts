import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DriverService } from "./driver.service"

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
  ride_id?: number;
  messages: Message[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DriverChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  // State subjects
  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private activeChatSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  private isSendingMessageSubject = new BehaviorSubject<boolean>(false);
  
  // Public observables
  chatSessions$ = this.chatSessionsSubject.asObservable();
  activeChatSession$ = this.activeChatSessionSubject.asObservable();
  isSendingMessage$ = this.isSendingMessageSubject.asObservable();

  // Polling interval
  private chatPollingInterval: any;

  constructor(
    private http: HttpClient,
    private driverService: DriverService
  ) {}

  // Getters for current values
  get chatSessions() { return this.chatSessionsSubject.value; }
  get activeChatSession() { return this.activeChatSessionSubject.value; }
  get isSendingMessage() { return this.isSendingMessageSubject.value; }

  // Load existing chat sessions
  loadChatSessions() {
    // This would typically load from your backend based on the driver's rides
    // For now, we'll maintain the existing chat sessions
    if (this.chatSessions.length === 0) {
      console.log('Loading existing chat sessions...');
      // You might want to load existing chat sessions from the backend here
    }
  }

  // Add rider to chat sessions
  addRiderToChat(riderId: number, riderName: string, rideId?: number) {
    const existingSession = this.chatSessions.find(session => 
      session.rider_id === riderId && session.ride_id === rideId
    );

    if (!existingSession) {
      const newSession: ChatSession = {
        rider_id: riderId,
        rider_name: riderName,
        ride_id: rideId,
        messages: [],
        isActive: false
      };
      
      const updatedSessions = [...this.chatSessions, newSession];
      this.chatSessionsSubject.next(updatedSessions);
      this.loadMessagesForSession(newSession);
    }
  }

  // Select chat session
  selectChatSession(session: ChatSession) {
    // Deactivate all sessions
    const updatedSessions = this.chatSessions.map(s => ({
      ...s,
      isActive: s.rider_id === session.rider_id && s.ride_id === session.ride_id
    }));
    
    this.chatSessionsSubject.next(updatedSessions);
    this.activeChatSessionSubject.next(session);
    
    // Load messages for this session
    this.loadMessagesForSession(session);
  }

  // Load messages for a session
  loadMessagesForSession(session: ChatSession) {
    const driverId = parseInt(this.driverService.driverDetails.driver_id);
    
    this.http.get<Message[]>(`${this.BASE_URL}/messages/conversation/${driverId}/${session.rider_id}`).subscribe({
      next: (messages) => {
      const filteredMessages = messages.filter(msg => 
          !session.ride_id || msg.ride_id === session.ride_id
        );

        // Update the session with messages
        const updatedSessions = this.chatSessions.map(s => {
          if (s.rider_id === session.rider_id && s.ride_id === session.ride_id) {
            return { ...s, messages: filteredMessages };
          }
          return s;
        });

        this.chatSessionsSubject.next(updatedSessions);

        // Update active session if it's the same
        if (this.activeChatSession?.rider_id === session.rider_id && 
            this.activeChatSession?.ride_id === session.ride_id) {
          this.activeChatSessionSubject.next({ ...session, messages: filteredMessages });
        }
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        // Set empty messages for the session
        const updatedSessions = this.chatSessions.map(s => {
          if (s.rider_id === session.rider_id && s.ride_id === session.ride_id) {
            return { ...s, messages: [] };
          }
          return s;
        });
        this.chatSessionsSubject.next(updatedSessions);
      }
    });
  }

  // Send message
  sendMessage(messageText: string): Observable<any> {
    return new Observable(observer => {
      if (!this.activeChatSession || !messageText.trim()) {
        observer.error('No active session or empty message');
        return;
      }

      this.isSendingMessageSubject.next(true);
      const token = localStorage.getItem('token');
      const driverDetails = this.driverService.driverDetails;

      if (!token) {
        this.driverService.showMessage('Authentication required. Please login again.', 'error');
        this.isSendingMessageSubject.next(false);
        observer.error('No authentication token');
        return;
      }

      const messageData = {
        sender_id: parseInt(driverDetails.driver_id),
        receiver_id: this.activeChatSession.rider_id,
        ride_id: this.activeChatSession.ride_id,
        message_text: messageText.trim()
      };

      this.http.post<any>(`${this.BASE_URL}/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          // Add message to local session
          const newMessage: Message = {
            message_id: response.message_id,
            sender_id: messageData.sender_id,
            receiver_id: messageData.receiver_id,
            ride_id: messageData.ride_id,
            message_text: messageData.message_text,
            sent_at: new Date().toISOString()
          };
          
          // Update sessions with new message
          if (this.activeChatSession) {
            const updatedSessions = this.chatSessions.map(session => {
              if (session.rider_id === this.activeChatSession!.rider_id && 
                  session.ride_id === this.activeChatSession!.ride_id) {
                return { ...session, messages: [...session.messages, newMessage] };
              }
              return session;
            });

            this.chatSessionsSubject.next(updatedSessions);
            
            // Update active session
            const updatedActiveSession = {
              ...this.activeChatSession,
              messages: [...this.activeChatSession.messages, newMessage]
            };
            this.activeChatSessionSubject.next(updatedActiveSession);
          }
          
          this.isSendingMessageSubject.next(false);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          this.driverService.showMessage('Failed to send message', 'error');
          this.isSendingMessageSubject.next(false);
          observer.error(err);
        }
      });
    });
  }

  // Check if message is from current user
  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === parseInt(this.driverService.driverDetails.driver_id);
  }

  // Start chat polling
  startChatPolling() {
    this.stopChatPolling(); // Clear any existing interval
    
    this.chatPollingInterval = setInterval(() => {
      if (this.activeChatSession) {
        this.loadMessagesForSession(this.activeChatSession);
      }
    }, 3000); // Poll every 3 seconds
  }

  // Stop chat polling
  stopChatPolling() {
    if (this.chatPollingInterval) {
      clearInterval(this.chatPollingInterval);
      this.chatPollingInterval = null;
    }
  }

  // Clear active session
  clearActiveSession() {
    this.activeChatSessionSubject.next(null);
    
    // Deactivate all sessions
    const updatedSessions = this.chatSessions.map(s => ({ ...s, isActive: false }));
    this.chatSessionsSubject.next(updatedSessions);
  }
}