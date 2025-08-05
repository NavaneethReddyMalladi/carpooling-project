import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DriverService } from "./driver.service"

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  ride_request_id?: number;
  message_text: string;
  sent_at: string;
}

export interface ChatSession {
  rider_id: number;
  rider_name: string;
  ride_request_id: number;
  request_status: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_time: string;
  messages: Message[];
  isActive: boolean;
}

export interface RideRequest {
  ride_request_id: number;
  request_id?: number; // Alternative field name
  rider_id: number;
  rider_name?: string;
  driver_id: number;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_time: string;
  created_at: string;
  accepted_at?: string;
  rider?: {
    user_name: string;
    [key: string]: any;
  };
  ride?: {
    origin_stop_id: string;
    destination_stop_id: string;
    departure_time: string;
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DriverChatService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private activeChatRider: {
    riderId: number;
    riderName: string;
    rideId?: number;
  } | null = null;

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

  // Load chat sessions for accepted ride requests
  loadChatSessions() {
    // Check if driver details are available
    if (!this.driverService.driverDetails || !this.driverService.driverDetails.driver_id) {
      console.error('Driver details not available');
      return;
    }

    const driverId = parseInt(this.driverService.driverDetails.driver_id);
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    console.log(`Loading chat sessions for driver ID: ${driverId}`);

    // Try the primary endpoint first
    this.http.get<any[]>(`${this.BASE_URL}/ride-requests/driver/${driverId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (rideRequests) => {
        console.log('Received ride requests:', rideRequests);
        this.processChatSessions(rideRequests);
      },
      error: (err) => {
        console.error('Primary endpoint failed:', err);
        // Try fallback method
        this.loadAllRideRequestsAndFilter(driverId, token);
      }
    });
  }

  private processChatSessions(rideRequests: any[]) {
    if (!Array.isArray(rideRequests)) {
      console.error('Invalid ride requests data:', rideRequests);
      this.chatSessionsSubject.next([]);
      return;
    }

    // Filter for accepted and in-progress requests
    const activeChatRequests = rideRequests.filter(request => {
      const status = request.status?.toLowerCase();
      return status === 'accepted' || status === 'in_progress' || status === 'in progress';
    });

    console.log('Active chat requests:', activeChatRequests);

    // Convert to ChatSession objects
    const chatSessions: ChatSession[] = activeChatRequests.map(request => {
      // Handle different API response structures
      const rideRequestId = request.request_id || request.ride_request_id;
      const riderName = request.rider?.user_name || request.rider_name || `Rider ${request.rider_id}`;
      const pickupLocation = request.ride?.origin_stop_id || request.pickup_location || 'Unknown pickup';
      const dropoffLocation = request.ride?.destination_stop_id || request.dropoff_location || 'Unknown destination';
      const scheduledTime = request.ride?.departure_time || request.scheduled_time || new Date().toISOString();

      return {
        rider_id: request.rider_id,
        rider_name: riderName,
        ride_request_id: rideRequestId,
        request_status: request.status,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        scheduled_time: scheduledTime,
        messages: [],
        isActive: false
      };
    });

    console.log('Processed chat sessions:', chatSessions);
    this.chatSessionsSubject.next(chatSessions);

    // Load messages for each session
    chatSessions.forEach(session => {
      this.loadMessagesForSession(session);
    });

    console.log(`Loaded ${chatSessions.length} active chat sessions`);
  }

  // Fallback method to load all ride requests and filter for accepted ones
  private loadAllRideRequestsAndFilter(driverId: number, token: string) {
    console.log('Using fallback method to load ride requests');
    
    this.http.get<RideRequest[]>(`${this.BASE_URL}/ride-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (allRequests) => {
        console.log('All ride requests (fallback):', allRequests);
        
        // Filter requests for this driver and accepted/in-progress status
        const driverAcceptedRequests = allRequests.filter(request => {
          const status = request.status?.toLowerCase();
          return request.driver_id === driverId && 
                 (status === 'accepted' || status === 'in_progress' || status === 'in progress');
        });
        
        console.log('Filtered driver requests:', driverAcceptedRequests);
        
        // Create chat sessions
        const chatSessions: ChatSession[] = driverAcceptedRequests.map(request => ({
          rider_id: request.rider_id,
          rider_name: request.rider_name || `Rider ${request.rider_id}`,
          ride_request_id: request.ride_request_id || request.request_id!,
          request_status: request.status,
          pickup_location: request.pickup_location,
          dropoff_location: request.dropoff_location,
          scheduled_time: request.scheduled_time,
          messages: [],
          isActive: false
        }));

        this.chatSessionsSubject.next(chatSessions);
        
        // Load messages for each session
        chatSessions.forEach(session => {
          this.loadMessagesForSession(session);
        });

        console.log(`Loaded ${chatSessions.length} accepted ride request chat sessions (fallback)`);
      },
      error: (err) => {
        console.error('Failed to load ride requests (fallback):', err);
        this.chatSessionsSubject.next([]);
      }
    });
  }

  // Add method to refresh chat sessions
  refreshChatSessions() {
    this.loadChatSessions();
  }

  // Select chat session
  selectChatSession(session: ChatSession) {
    console.log('Selecting chat session:', session);
    
    // Deactivate all sessions
    const updatedSessions = this.chatSessions.map(s => ({
      ...s,
      isActive: s.ride_request_id === session.ride_request_id
    }));
    
    this.chatSessionsSubject.next(updatedSessions);
    
    // Set the active session with the updated isActive flag
    const activeSession = { ...session, isActive: true };
    this.activeChatSessionSubject.next(activeSession);
    
    // Load messages for this session
    this.loadMessagesForSession(activeSession);
  }

  // Load messages for a session
  loadMessagesForSession(session: ChatSession) {
    const driverId = parseInt(this.driverService.driverDetails.driver_id);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token available for loading messages');
      return;
    }

    console.log(`Loading messages for ride request ID: ${session.ride_request_id}`);
    
    // Try ride-request specific endpoint first
    this.http.get<Message[]>(`${this.BASE_URL}/messages/ride-request/${session.ride_request_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (messages) => {
        console.log('Messages loaded:', messages);
        this.updateSessionMessages(session, messages);
      },
      error: (err) => {
        console.error('Failed to load messages from ride-request endpoint:', err);
        // Try fallback conversation endpoint
        this.loadMessagesForSessionFallback(session, driverId);
      }
    });
  }

  // Fallback method using conversation endpoint
  private loadMessagesForSessionFallback(session: ChatSession, driverId: number) {
    const token = localStorage.getItem('token');
    
    console.log(`Loading messages (fallback) for conversation: ${driverId} <-> ${session.rider_id}`);
    
    this.http.get<Message[]>(`${this.BASE_URL}/messages/conversation/${driverId}/${session.rider_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (messages) => {
        console.log('Messages loaded (fallback):', messages);
        
        // Filter messages for this specific ride request if ride_request_id is available
        const filteredMessages = messages.filter(msg => 
          !msg.ride_request_id || msg.ride_request_id === session.ride_request_id
        );

        this.updateSessionMessages(session, filteredMessages);
      },
      error: (err) => {
        console.error('Failed to load messages (fallback):', err);
        // Set empty messages for the session
        this.updateSessionMessages(session, []);
      }
    });
  }

  private updateSessionMessages(session: ChatSession, messages: Message[]) {
    const oldSession = this.chatSessions.find(s => s.ride_request_id === session.ride_request_id);
    const oldMessages = oldSession?.messages || [];
  
    // Skip update if messages are same (avoid UI refresh)
    if (JSON.stringify(oldMessages) === JSON.stringify(messages)) {
      return;
    }
  
    const updatedSessions = this.chatSessions.map(s => {
      if (s.ride_request_id === session.ride_request_id) {
        return { ...s, messages };
      }
      return s;
    });
  
    this.chatSessionsSubject.next(updatedSessions);
  
    if (this.activeChatSession?.ride_request_id === session.ride_request_id) {
      this.activeChatSessionSubject.next({ ...this.activeChatSession, messages });
    }
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
        ride_request_id: this.activeChatSession.ride_request_id,
        message_text: messageText.trim()
      };

      console.log('Sending message:', messageData);

      this.http.post<any>(`${this.BASE_URL}/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          console.log('Message sent successfully:', response);
          
          // Add message to local session
          const newMessage: Message = {
            message_id: response.message_id || Date.now(),
            sender_id: messageData.sender_id,
            receiver_id: messageData.receiver_id,
            ride_request_id: messageData.ride_request_id,
            message_text: messageData.message_text,
            sent_at: new Date().toISOString()
          };
          
          // Update sessions with new message
          if (this.activeChatSession) {
            const updatedSessions = this.chatSessions.map(session => {
              if (session.ride_request_id === this.activeChatSession!.ride_request_id) {
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
    this.stopChatPolling();
    
    this.chatPollingInterval = setInterval(() => {
      // Refresh chat sessions to get new accepted requests
      this.refreshChatSessions();
      
      // Load messages for active session
      if (this.activeChatSession) {
        this.loadMessagesForSession(this.activeChatSession);
      }
    }, 5000);
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

  // Helper method to get session status display text
  getSessionStatusText(session: ChatSession): string {
    switch (session.request_status?.toLowerCase()) {
      case 'accepted': return 'Ride Accepted';
      case 'in_progress': 
      case 'in progress': return 'Ride in Progress';
      default: return session.request_status || 'Unknown Status';
    }
  }

  addRiderToChat(riderId: number, riderName: string, rideId?: number): void {
    this.activeChatRider = { riderId, riderName, rideId };
  }

  getActiveChatRider() {
    return this.activeChatRider;
  }

  clearActiveChatRider() {
    this.activeChatRider = null;
  }
}