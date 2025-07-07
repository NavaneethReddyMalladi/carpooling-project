import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface Stop {
  id: string;
  name: string;
}

interface Ride {
  ride_id?: string;
  driver_name: string;
  driver_id?: string;
  origin_stop_id: string;
  destination_stop_id: string;
  departure_time: string;
  available_seats?: number;
  seats?: number;
  price?: number;
  status?: string;
}

interface RiderDetails {
  rider_id: string;
  rider_name: string;
  email: string;
  phone_number: string;
  gender: string;
  is_verified: boolean;
  role_id: string;
  create_datetime: string;
  driver_id: string | null;
  start_stop_id?: string;
  destination_stop_id?: string;
}

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  ride_id?: number;
  message_text: string;
  sent_at: string;
}

interface ChatSession {
  driver_id: number;
  driver_name: string;
  ride_id?: number;
  messages: Message[];
  isActive: boolean;
}

@Component({
  selector: 'app-rider-dashboard',
  templateUrl: './riderdashboard.component.html',
  styleUrls: ['./riderdashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RiderDashboardComponent implements OnInit {
  sourceStops: Stop[] = [];
  destStops: Stop[] = [];
  rides: Ride[] = [];
  selectedRide: Ride | null = null;

  selectedSource = '';
  selectedDest = '';
  currentUser: any;

  stops: any[] = [];
  isLoading = false;
  isBooking = false;
  isEditingProfile = false; 
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Profile menu state
  isProfileMenuOpen = false;
  
  // Sidebar state
  isSidebarOpen = false;
  
  // State to control when to show profile management
  showProfileManagement = false;

  // Chat feature states
  showChat = false;
  chatSessions: ChatSession[] = [];
  activeChatSession: ChatSession | null = null;
  newMessage = '';
  isSendingMessage = false;
  chatPollingInterval: any;

  riderDetails: RiderDetails = {
    rider_id: '',
    rider_name: '',
    email: '',
    phone_number: '',
    gender: '',
    is_verified: false,
    role_id: '',
    create_datetime: '',
    driver_id: null,
    start_stop_id: '',
    destination_stop_id: ''
  };
  
  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: object,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadStopsAndSources();

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const riderId = decoded.sub?.user_id || decoded.user_id || decoded.sub;
          
          if (riderId) {
            this.loadRiderDetails(riderId, token);
            this.loadChatSessions();
          } else {
            console.error('User ID not found in token');
            this.showMessage('Authentication error. Please login again.', 'error');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          this.showMessage('Invalid token. Please login again.', 'error');
        }
      } else {
        console.error('No token found in localStorage');
        this.router.navigate(['/login']);
      }
    }
  }

  ngOnDestroy() {
    if (this.chatPollingInterval) {
      clearInterval(this.chatPollingInterval);
    }
  }

  loadRiderDetails(riderId: string, token: string) {
    this.http.get<any>(`http://127.0.0.1:42099/users/${riderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (rider) => {
        this.riderDetails.rider_id = rider.user_id;
        this.riderDetails.rider_name = rider.user_name || rider.name || 'Unknown User';
        this.riderDetails.gender = rider.gender || 'Not specified';
        this.riderDetails.phone_number = rider.phone_number || '';
        this.riderDetails.start_stop_id = rider.start_stop_id || '';
        this.riderDetails.destination_stop_id = rider.destination_stop_id || '';
        this.riderDetails.email=rider.email
      },
      error: (err) => {
        console.error('Failed to load rider info:', err);
        this.showMessage('Failed to load user information', 'error');
      }
    });
  }

  loadStopsAndSources() {
    this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
      next: (stopsData) => {
        this.stops = Array.isArray(stopsData) ? stopsData : [];

        this.http.get<any[]>('http://127.0.0.1:42099/route-stops/sources').subscribe({
          next: (sourcesData) => {
            this.sourceStops = sourcesData.map(stop => ({
              id: stop.stop_id,
              name: stop.stop_name
            }));
          },
          error: (err) => {
            console.error('Failed to fetch sources:', err);
            this.sourceStops = [];
            this.showMessage('Failed to load source locations', 'error');
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch stops:', err);
        this.stops = [];
        this.showMessage('Failed to load stops data', 'error');
      }
    });
  }

  onSourceChange() {
    this.selectedDest = '';
    this.destStops = [];
    this.rides = [];

    if (this.selectedSource) {
      this.http.get<any>('http://127.0.0.1:42099/route-stops/destinations', {
        params: new HttpParams().set('source_stop_id', this.selectedSource)
      }).subscribe({
        next: (destResponse) => {
          let destinations = [];
    
          if (Array.isArray(destResponse)) {
            destinations = destResponse;
          } else if (Array.isArray(destResponse.destinations)) {
            destinations = destResponse.destinations;
          }

          const uniqueDestIds: string[] = Array.from(
            new Set(
              destinations.map((dest: any) => String(dest.stop_id || dest.end_stop_id))
            )
          );
          
          this.destStops = uniqueDestIds.map((stopId:string) => {
            const stopInfo = this.stops.find(s =>String(s.stop_id) === stopId);
            return {
              id: stopId,
              name: stopInfo ?.stop_name ?? `Stop ${stopId}`
            };
          });
        },
        error: (err) => {
          console.error('Failed to fetch destinations:', err);
          this.destStops = [];
          this.showMessage('Failed to load destination options', 'error');
        }
      });
    }
  }

  searchRides() {
    if (this.selectedSource && this.selectedDest) {
      this.isLoading = true;
      this.rides = [];
      
      const params = new HttpParams()
        .set('origin_stop_id', this.selectedSource)
        .set('destination_stop_id', this.selectedDest);

      this.http.get<any[]>('http://127.0.0.1:42099/rides/search', { params }).subscribe({
        next: (data) => {
          this.rides = Array.isArray(data) ? data : [];
          this.isLoading = false;
          
          if (this.rides.length === 0) {
            this.showMessage('No rides found for this route', 'error');
          }
        },
        error: (err) => {
          console.error('Failed to fetch rides:', err);
          this.rides = [];
          this.isLoading = false;
          this.showMessage('Failed to search for rides', 'error');
        }
      });
    }
  }

  bookRide(ride: Ride) {
    this.selectedRide = ride;
    this.riderDetails.start_stop_id = ride.origin_stop_id;
    this.riderDetails.destination_stop_id = ride.destination_stop_id;
  }

  closeBookingModal() {
    this.selectedRide = null;
  }

  confirmBooking() {
    if (!this.selectedRide) return;

    this.isBooking = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.showMessage('Authentication required. Please login again.', 'error');
      this.isBooking = false;
      return;
    }

    const bookingData = {
      ride_id: this.selectedRide.ride_id,
      rider_id: this.riderDetails.rider_id,
      rider_name: this.riderDetails.rider_name,
      start_stop_id: this.riderDetails.start_stop_id,
      destination_stop_id: this.riderDetails.destination_stop_id,
      gender: this.riderDetails.gender,
      booking_time: new Date().toISOString()
    };

    this.http.post('http://127.0.0.1:42099/ride-requests', bookingData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        this.showMessage('Ride booked successfully!', 'success');
        this.closeBookingModal();
        this.searchRides();
        this.isBooking = false;
        
        // Add driver to chat sessions after successful booking
        if (this.selectedRide && this.selectedRide.driver_id) {
          this.addDriverToChat(
            parseInt(this.selectedRide.driver_id), 
            this.selectedRide.driver_name,
            this.selectedRide.ride_id ? parseInt(this.selectedRide.ride_id) : undefined
          );
        }
      },
      error: (err) => {
        console.error('Failed to book ride:', err);
        this.showMessage(
          err.error?.message || 'Failed to book ride. Please try again.', 
          'error'
        );
        this.isBooking = false;
      }
    });
  }

  // Chat functionality methods
  openChat() {
    this.showChat = true;
    this.loadChatSessions();
    this.startChatPolling();
  }

  closeChat() {
    this.showChat = false;
    this.activeChatSession = null;
    this.stopChatPolling();
  }

  loadChatSessions() {
    // This would typically load from your backend based on the rider's bookings
    // For now, we'll maintain the existing chat sessions
    if (this.chatSessions.length === 0) {
      // You might want to load existing chat sessions from the backend here
      console.log('Loading existing chat sessions...');
    }
  }

  addDriverToChat(driverId: number, driverName: string, rideId?: number) {
    // Check if chat session already exists
    const existingSession = this.chatSessions.find(session => 
      session.driver_id === driverId && session.ride_id === rideId
    );

    if (!existingSession) {
      const newSession: ChatSession = {
        driver_id: driverId,
        driver_name: driverName,
        ride_id: rideId,
        messages: [],
        isActive: false
      };
      
      this.chatSessions.push(newSession);
      this.loadMessagesForSession(newSession);
    }
  }

  selectChatSession(session: ChatSession) {
    // Deactivate all sessions
    this.chatSessions.forEach(s => s.isActive = false);
    
    // Activate selected session
    session.isActive = true;
    this.activeChatSession = session;
    
    // Load messages for this session
    this.loadMessagesForSession(session);
  }

  loadMessagesForSession(session: ChatSession) {
    const riderId = parseInt(this.riderDetails.rider_id);
    
    this.http.get<Message[]>(`http://127.0.0.1:42099/messages/conversation/${riderId}/${session.driver_id}`).subscribe({
      next: (messages) => {
        session.messages = messages.filter(msg => 
          !session.ride_id || msg.ride_id === session.ride_id
        );
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        session.messages = [];
      }
    });
  }

  sendMessage() {
    if (!this.activeChatSession || !this.newMessage.trim()) return;

    this.isSendingMessage = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.showMessage('Authentication required. Please login again.', 'error');
      this.isSendingMessage = false;
      return;
    }

    const messageData = {
      sender_id: parseInt(this.riderDetails.rider_id),
      receiver_id: this.activeChatSession.driver_id,
      ride_id: this.activeChatSession.ride_id,
      message_text: this.newMessage.trim()
    };

    this.http.post<any>('http://127.0.0.1:42099/messages', messageData, {
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
        
        if (this.activeChatSession) {
          this.activeChatSession.messages.push(newMessage);
        }
        
        this.newMessage = '';
        this.isSendingMessage = false;
        
        // Scroll to bottom of chat
        setTimeout(() => this.scrollChatToBottom(), 100);
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.showMessage('Failed to send message', 'error');
        this.isSendingMessage = false;
      }
    });
  }

  startChatPolling() {
    this.stopChatPolling(); // Clear any existing interval
    
    this.chatPollingInterval = setInterval(() => {
      if (this.activeChatSession) {
        this.loadMessagesForSession(this.activeChatSession);
      }
    }, 3000); // Poll every 3 seconds
  }

  stopChatPolling() {
    if (this.chatPollingInterval) {
      clearInterval(this.chatPollingInterval);
      this.chatPollingInterval = null;
    }
  }

  scrollChatToBottom() {
    const chatMessagesContainer = document.querySelector('.chat-messages');
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.sender_id === parseInt(this.riderDetails.rider_id);
  }

  getStopName(stopId: string): string {
    const stop = this.stops.find(s => s.stop_id === stopId);
    return stop ? stop.stop_name : `Stop ${stopId}`;
  }

  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  formatMessageTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // Sidebar methods
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  // Profile menu methods
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  // Sidebar menu methods - Manage Account from sidebar
  manageAccount() {
    this.closeSidebar();
    this.showProfileManagement = true;
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.showMessage('Authentication required. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }
  
    if (!this.riderDetails.rider_id) {
      this.showMessage('User ID missing', 'error');
      return;
    }
  
    // Fetch full rider details from backend
    this.http.get<any>(`http://127.0.0.1:42099/users/${this.riderDetails.rider_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.riderDetails = {
          rider_id: data.user_id,
          rider_name: data.user_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          gender: data.gender || '',
          is_verified: data.is_verified || false,
          role_id: data.role_id || '',
          create_datetime: data.create_datetime || '',
          driver_id: data.driver_id || null
        };
        this.isEditingProfile = false;
      },
      error: (err) => {
        console.error('Failed to load rider details:', err);
        this.showMessage('Failed to load account details', 'error');
      }
    });
  }

  // Hide profile management
  hideProfileManagement() {
    this.showProfileManagement = false;
    this.isEditingProfile = false;
  }
  
  editProfile() {
    this.isEditingProfile = true;
  }
  
  saveProfile() {
    if (!this.riderDetails.rider_id) {
      this.showMessage('User ID missing', 'error');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.showMessage('Authentication required. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }
  
    const updatePayload = {
      user_name: this.riderDetails.rider_name,
      start_stop_id: this.riderDetails.start_stop_id,
      destination_stop_id: this.riderDetails.destination_stop_id,
      gender: this.riderDetails.gender
    };
  
    this.http.put(`http://127.0.0.1:42099/users/${this.riderDetails.rider_id}`, updatePayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res) => {
        this.showMessage('Profile updated successfully!', 'success');
        this.isEditingProfile = false;
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.showMessage('Failed to update profile', 'error');
      }
    });
  }
  
  cancelEdit() {
    this.isEditingProfile = false;
    this.manageAccount(); // Reload original data
  }
  
  // Sidebar menu methods
  viewRides() {
    console.log('Navigate to view rides');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/my-rides']); 
  }

  driveAndDeliver() {
    console.log('Navigate to drive & deliver');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/drive-deliver']);
  }

  openUberEats() {
    console.log('Navigate to Uber Eats');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/uber-eats']);
  }

  openUberBusiness() {
    console.log('Navigate to Uber for Business');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/uber-business']);
  }

  openHelp() {
    console.log('Navigate to help');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/help']);
  }

  openWallet() {
    console.log('Navigate to wallet');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/wallet']);
  }

  openActivity() {
    console.log('Navigate to activity');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/activity']);
  }

  openSupport() {
    console.log('Navigate to support');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/support']);
  }

  openTermsConditions() {
    console.log('Navigate to terms & conditions');
    this.closeSidebar();
    // Add your navigation logic here
    // this.router.navigate(['/terms-conditions']);
  }

  logout() {
    this.closeChat(); // Stop chat polling
    this.closeProfileMenu();
    this.closeSidebar();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}