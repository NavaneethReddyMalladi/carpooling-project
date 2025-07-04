// import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { jwtDecode } from 'jwt-decode';
// import { Router } from '@angular/router';

// interface Stop {
//   id: string;
//   name: string;
// }

// interface Ride {
//   ride_id: number;
//   origin_stop_id: number;
//   destination_stop_id: number;
//   departure_time: string;
//   available_seats: number;
//   status: string;
//   created_at?: string;
//   fare?: number;
//   passenger_count?: number;
//   origin_name?: string;
//   destination_name?: string;
// }

// interface RideRequest {
//   request_id: number;
//   ride_id: number;
//   rider_id: number;
//   status: string;
//   requested_at: string;
//   ride?: {
//     origin_name?: string;
//     destination_name?: string;
//     departure_time?: string;
//     available_seats?: number;
//   };
//   rider?: {
//     user_name?: string;
//     phone?: string;
//     rating?: number;
//   };
// }

// interface DashboardStats {
//   todayEarnings: number;
//   totalRides: number;
//   completedRides: number;
//   cancelledRides: number;
//   activeRides: number;
//   rating: number;
//   onlineHours: number;
// }

// @Component({
//   selector: 'app-driver-dashboard',
//   templateUrl: './driverdashboard.component.html',
//   styleUrls: ['./driverdashboard.component.css'],
//   standalone: true,
//   imports: [CommonModule, FormsModule]
// })
// export class DriverDashboardComponent implements OnInit, OnDestroy {
//   stops: any[] = [];
  
//   // Separate arrays for source and destination dropdowns
//   sourceStops: Stop[] = [];
//   destStops: Stop[] = [];
  
//   driverDetails: any = {
//     driver_id: '',
//     driver_name: '',
//     gender: '',
//     phone: '',
//     email: '',
//     rating: 0,
//     totalRides: 0,
//     status: 'offline'
//   };

//   ride = {
//     origin_stop_id: '',
//     destination_stop_id: '',
//     departure_time: '',
//     available_seats: 1,
//     route_id: '',
//   };

//   // Dashboard stats
//   dashboardStats: DashboardStats = {
//     todayEarnings: 0,
//     totalRides: 0,
//     completedRides: 0,
//     cancelledRides: 0,
//     activeRides: 0,
//     rating: 0,
//     onlineHours: 0
//   };

//   // Rides data
//   activeRides: Ride[] = [];
//   completedRides: Ride[] = [];
//   cancelledRides: Ride[] = [];
//   recentRides: any[] = [];

//   // Ride requests data
//   pendingRequests: RideRequest[] = [];
//   allRequests: RideRequest[] = [];
//   newRequestsCount = 0;

//   // UI state
//   message = '';
//   error = '';
//   showProfileMenu = false;
//   isOnline = false;
//   activeTab = 'dashboard';
//   ridesSubTab = 'active'; // for rides tab sub-navigation
//   requestsSubTab = 'pending'; // for requests tab sub-navigation
//   isLoading = false;
//   showRequestNotification = false;

//   // Polling for requests
//   private requestPollingInterval: any;
//   private readonly POLLING_INTERVAL = 30000; // 30 seconds

//   constructor(
//     private http: HttpClient, 
//     @Inject(PLATFORM_ID) private platformId: object,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadStopsAndSources();
//     this.loadDriverData();
//     this.loadDashboardStats();
//     this.loadDriverRides();
//     this.startRequestPolling();
//   }

//   ngOnDestroy() {
//     this.stopRequestPolling();
//   }

//   loadDriverData() {
//     if (isPlatformBrowser(this.platformId)) {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const decoded: any = jwtDecode(token);
//           const driverId = decoded.sub?.user_id || decoded.user_id;
          
//           if (driverId) {
//             this.loadDriverDetails(driverId, token);
//           } else {
//             console.error('Driver ID not found in token');
//             this.redirectToLogin();
//           }
//         } catch (error) {
//           console.error('Error decoding token:', error);
//           this.redirectToLogin();
//         }
//       } else {
//         console.error('No token found in localStorage');
//         this.redirectToLogin();
//       }
//     }
//   }

//   loadDriverDetails(driverId: string, token: string) {
//     this.http.get<any>(`http://127.0.0.1:42099/users/${driverId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }).subscribe({
//       next: (driver) => {
//         this.driverDetails.driver_id = driver.driver_id;
//         this.driverDetails.driver_name = driver.user_name;
//         this.driverDetails.gender = driver.gender;
//         this.driverDetails.phone = driver.phone || 'Not provided';
//         this.driverDetails.email = driver.email || 'Not provided';
//         this.driverDetails.status = driver.status || 'offline';
//         this.isOnline = this.driverDetails.status === 'online';
        
//         // Load ride requests if driver is online
//         if (this.isOnline) {
//           this.loadRideRequests();
//         }
//       },
//       error: (err) => {
//         console.error('Failed to load driver info:', err);
//         this.error = 'Failed to load driver information';
//       }
//     });
//   }

//   loadStopsAndSources() {
//     this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
//       next: (stopsData) => {
//         this.stops = Array.isArray(stopsData) ? stopsData : [];

//         // Load source stops from route-stops/sources endpoint
//         this.http.get<any[]>('http://127.0.0.1:42099/route-stops/sources').subscribe({
//           next: (sourcesData) => {
//             this.sourceStops = sourcesData.map(stop => ({
//               id: stop.stop_id,
//               name: stop.stop_name
//             }));
//           },
//           error: (err) => {
//             console.error('Failed to fetch sources:', err);
//             this.sourceStops = [];
//             this.error = 'Failed to load source locations';
//           }
//         });
//       },
//       error: (err) => {
//         console.error('Failed to fetch stops:', err);
//         this.stops = [];
//         this.error = 'Failed to load stops data';
//       }
//     });
//   }

//   onOriginStopChange() {
//     // Reset destination selection when origin changes
//     this.ride.destination_stop_id = '';
//     this.destStops = [];

//     if (this.ride.origin_stop_id) {
//       this.http.get<any>('http://127.0.0.1:42099/route-stops/destinations', {
//         params: new HttpParams().set('source_stop_id', this.ride.origin_stop_id)
//       }).subscribe({
//         next: (destResponse) => {
//           let destinations = [];
    
//           if (Array.isArray(destResponse)) {
//             destinations = destResponse;
//           } else if (Array.isArray(destResponse.destinations)) {
//             destinations = destResponse.destinations;
//           }

//           const uniqueDestIds: string[] = Array.from(
//             new Set(
//               destinations.map((dest: any) => String(dest.stop_id || dest.end_stop_id))
//             )
//           );

//           this.destStops = uniqueDestIds.map((stopId: string) => {
//             const stopInfo = this.stops.find(s => String(s.stop_id) === stopId);
//             return {
//               id: stopId,
//               name: stopInfo?.stop_name ?? `Stop ${stopId}`
//             };
//           });
//         },
//         error: (err) => {
//           console.error('Failed to fetch destinations:', err);
//           this.destStops = [];
//           this.error = 'Failed to load destination options';
//         }
//       });
//     }
//   }

//   // Load actual dashboard statistics
//   loadDashboardStats() {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     // Get driver's rides statistics
//     this.http.get<any>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}/stats`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: (stats) => {
//         this.dashboardStats = {
//           todayEarnings: stats.todayEarnings || 0,
//           totalRides: stats.totalRides || 0,
//           completedRides: stats.completedRides || 0,
//           cancelledRides: stats.cancelledRides || 0,
//           activeRides: stats.activeRides || 0,
//           rating: stats.averageRating || 0,
//           onlineHours: stats.onlineHours || 0
//         };
//       },
//       error: (err) => {
//         console.log('Stats API not available, using fallback method');
//         this.calculateStatsFromRides();
//       }
//     });
//   }

//   // Fallback method to calculate stats from rides data
//   calculateStatsFromRides() {
//     const token = localStorage.getItem('token');
//     if (!token || !this.driverDetails.driver_id) return;

//     this.http.get<Ride[]>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: (rides) => {
//         const today = new Date().toDateString();
        
//         this.dashboardStats = {
//           totalRides: rides.length,
//           completedRides: rides.filter(r => r.status === 'completed').length,
//           cancelledRides: rides.filter(r => r.status === 'cancelled').length,
//           activeRides: rides.filter(r => r.status === 'active').length,
//           todayEarnings: rides
//             .filter(r => r.status === 'completed' && new Date(r.departure_time).toDateString() === today)
//             .reduce((sum, r) => sum + (r.fare || 0), 0),
//           rating: this.driverDetails.rating || 0,
//           onlineHours: 0 // This would need to be tracked separately
//         };
//       },
//       error: (err) => {
//         console.error('Failed to load rides for stats:', err);
//         // Keep default values
//       }
//     });
//   }

//   // Load driver's rides
//   loadDriverRides() {
//     const token = localStorage.getItem('token');
//     if (!token || !this.driverDetails.driver_id) return;

//     this.http.get<Ride[]>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: (rides) => {
//         // Add stop names to rides
//         const ridesWithNames = rides.map(ride => ({
//           ...ride,
//           origin_name: this.getStopName(ride.origin_stop_id.toString()),
//           destination_name: this.getStopName(ride.destination_stop_id.toString())
//         }));

//         // Separate rides by status
//         this.activeRides = ridesWithNames.filter(r => r.status === 'active');
//         this.completedRides = ridesWithNames.filter(r => r.status === 'completed');
//         this.cancelledRides = ridesWithNames.filter(r => r.status === 'cancelled');
        
//         // Recent rides (last 10 rides)
//         this.recentRides = ridesWithNames
//           .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
//           .slice(0, 10)
//           .map(ride => ({
//             id: ride.ride_id,
//             origin: ride.origin_name,
//             destination: ride.destination_name,
//             time: this.getRelativeTime(ride.departure_time),
//             fare: ride.fare || 0,
//             status: ride.status,
//             rating: 0 // This would come from ratings table
//           }));
//       },
//       error: (err) => {
//         console.error('Failed to load driver rides:', err);
//         this.error = 'Failed to load rides data';
//       }
//     });
//   }

//   // Load ride requests for the driver
//   loadRideRequests() {
//     const token = localStorage.getItem('token');
//     if (!token || !this.driverDetails.driver_id) return;

//     this.http.get<RideRequest[]>(`http://127.0.0.1:42099/ride-requests/driver/${this.driverDetails.driver_id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: (requests) => {
//         const previousPendingCount = this.pendingRequests.length;
//         this.allRequests = requests;
//         this.pendingRequests = requests.filter(r => r.status === 'Pending');
        
//         // Check for new requests
//         if (this.pendingRequests.length > previousPendingCount && previousPendingCount > 0) {
//           this.newRequestsCount = this.pendingRequests.length - previousPendingCount;
//           this.showRequestNotification = true;
//           this.playNotificationSound();
//           setTimeout(() => {
//             this.showRequestNotification = false;
//             this.newRequestsCount = 0;
//           }, 5000);
//         }
//       },
//       error: (err) => {
//         console.error('Failed to load ride requests:', err);
//       }
//     });
//   }

//   // Start polling for ride requests
//   startRequestPolling() {
//     if (this.isOnline) {
//       this.requestPollingInterval = setInterval(() => {
//         this.loadRideRequests();
//       }, this.POLLING_INTERVAL);
//     }
//   }

//   // Stop polling for ride requests
//   stopRequestPolling() {
//     if (this.requestPollingInterval) {
//       clearInterval(this.requestPollingInterval);
//       this.requestPollingInterval = null;
//     }
//   }

//   // Accept a ride request
//   acceptRideRequest(requestId: number) {
//     if (!confirm('Accept this ride request?')) return;

//     const token = localStorage.getItem('token');
//     this.http.patch(`http://127.0.0.1:42099/ride-requests/${requestId}`, 
//       { status: 'Accepted' },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => {
//         this.message = 'Ride request accepted successfully!';
//         this.loadRideRequests();
//         this.loadDriverRides();
//         this.loadDashboardStats();
        
//         // Send notification to rider
//         const request = this.pendingRequests.find(r => r.request_id === requestId);
//         if (request) {
//           this.sendNotificationToRider(request.rider_id, 'Your ride request has been accepted!');
//         }
//       },
//       error: (err) => {
//         console.error('Failed to accept ride request:', err);
//         this.error = 'Failed to accept ride request';
//       }
//     });
//   }

//   // Reject a ride request
//   rejectRideRequest(requestId: number) {
//     if (!confirm('Reject this ride request?')) return;

//     const token = localStorage.getItem('token');
//     this.http.patch(`http://127.0.0.1:42099/ride-requests/${requestId}`, 
//       { status: 'Rejected' },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => {
//         this.message = 'Ride request rejected';
//         this.loadRideRequests();
        
//         // Send notification to rider
//         const request = this.pendingRequests.find(r => r.request_id === requestId);
//         if (request) {
//           this.sendNotificationToRider(request.rider_id, 'Your ride request has been rejected.');
//         }
//       },
//       error: (err) => {
//         console.error('Failed to reject ride request:', err);
//         this.error = 'Failed to reject ride request';
//       }
//     });
//   }

//   // Send notification message to rider
//   sendNotificationToRider(riderId: number, messageText: string) {
//     const token = localStorage.getItem('token');
//     const messageData = {
//       sender_id: this.driverDetails.driver_id,
//       receiver_id: riderId,
//       message_text: messageText
//     };

//     this.http.post('http://127.0.0.1:42099/messages', messageData, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: () => {
//         console.log('Notification sent to rider');
//       },
//       error: (err) => {
//         console.error('Failed to send notification:', err);
//       }
//     });
//   }

//   // Play notification sound
//   playNotificationSound() {
//     try {
//       const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeBC+J2fPCdSYEK4DL8NiKOAkasKjm7bJgGgU7k9n0unEpBSl8yO3eizEHHnPI7eeXSQwOUqjn77BdGAU9jNrsx2wgBCl+x+3fjzQHG3DF8eeSSgwKTqHh5KVlGgc4mtv0v2kfBit82e7elEMNE1qi5O2eSgoKTqHj5ahVFgtIqd3v1W8aBC16zNzYijMHG3DL8OOaUgsEVKjo1nIpBy16kNvzunUqBSp9yOzfhzEKGW/G7eSXTQsIS6Hl7aNcGgU8jNnuyWwgBCh9x+7ghzIKGXPI7+aVSQsLUKfn76hZFQlHpta0MnkfBCt8xO3bgjMJGnDI8eiSUgwJVKvp3ZlMEAhOo+PqnlgLBzGN2fXKfScBJ33H8dyPQgwSTKDi6alpHgc2k9n0w2sfBSl7zOzeiTcJGG+97d6ONggZdMLx14xADAhRpuHpqVAKDlap2urHfSwEB1Wk5Om0X'); 
//       audio.play().catch(e => console.log('Could not play notification sound'));
//     } catch (e) {
//       console.log('Could not play notification sound');
//     }
//   }

//   createRide() {
//     this.error = '';
//     this.message = '';
//     this.isLoading = true;

//     if (!this.ride.origin_stop_id || !this.ride.destination_stop_id || !this.ride.departure_time || !this.ride.available_seats) {
//       this.error = 'Please fill all required fields.';
//       this.isLoading = false;
//       return;
//     }

//     if (this.ride.origin_stop_id === this.ride.destination_stop_id) {
//       this.error = 'Origin and destination cannot be the same.';
//       this.isLoading = false;
//       return;
//     }

//     const departureDate = new Date(this.ride.departure_time);
//     const now = new Date();
    
//     if (departureDate <= now) {
//       this.error = 'Departure time must be in the future.';
//       this.isLoading = false;
//       return;
//     }

//     const pad = (n: number) => (n < 10 ? '0' + n : n);
//     const formattedDepartureTime = 
//       `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())} ` +
//       `${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:00`;

//     const postData = {
//       driver_id: this.driverDetails.driver_id,
//       origin_stop_id: Number(this.ride.origin_stop_id),
//       destination_stop_id: Number(this.ride.destination_stop_id),
//       departure_time: formattedDepartureTime,
//       available_seats: Number(this.ride.available_seats),
//       route_id: this.ride.route_id ? Number(this.ride.route_id) : null,
//       status: 'active'
//     };

//     const token = localStorage.getItem('token');
    
//     this.http.post('http://127.0.0.1:42099/rides', postData, { 
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }).subscribe({
//       next: () => {
//         this.message = 'Ride created successfully! Passengers can now book your ride.';
//         this.error = '';
//         this.resetForm();
//         this.isLoading = false;
//         // Refresh data
//         this.loadDashboardStats();
//         this.loadDriverRides();
//       },
//       error: err => {
//         console.error(err);
//         this.error = 'Failed to create ride. Please try again.';
//         this.isLoading = false;
//       }
//     });
//   }

//   // Cancel a ride
//   cancelRide(rideId: number) {
//     if (!confirm('Are you sure you want to cancel this ride?')) return;

//     const token = localStorage.getItem('token');
//     this.http.patch(`http://127.0.0.1:42099/rides/${rideId}`, 
//       { status: 'cancelled' },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => {
//         this.message = 'Ride cancelled successfully';
//         this.loadDriverRides();
//         this.loadDashboardStats();
//       },
//       error: (err) => {
//         console.error('Failed to cancel ride:', err);
//         this.error = 'Failed to cancel ride';
//       }
//     });
//   }

//   // Complete a ride
//   completeRide(rideId: number) {
//     if (!confirm('Mark this ride as completed?')) return;

//     const token = localStorage.getItem('token');
//     this.http.patch(`http://127.0.0.1:42099/rides/${rideId}`, 
//       { status: 'completed' },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => {
//         this.message = 'Ride marked as completed';
//         this.loadDriverRides();
//         this.loadDashboardStats();
//       },
//       error: (err) => {
//         console.error('Failed to complete ride:', err);
//         this.error = 'Failed to complete ride';
//       }
//     });
//   }

//   resetForm() {
//     this.ride = {
//       origin_stop_id: '',
//       destination_stop_id: '',
//       departure_time: '',
//       available_seats: 1,
//       route_id: '',
//     };
//     this.destStops = [];
//   }

//   toggleProfileMenu() {
//     this.showProfileMenu = !this.showProfileMenu;
//   }

//   // Fixed online/offline toggle
//   toggleOnlineStatus() {
//     const newStatus = !this.isOnline;
//     const token = localStorage.getItem('token');
    
//     if (!token || !this.driverDetails.driver_id) {
//       this.error = 'Unable to update status. Please try logging in again.';
//       return;
//     }

//     // Try updating driver status via users endpoint
//     this.http.patch(`http://127.0.0.1:42099/users/${this.driverDetails.driver_id}`, 
//       { status: newStatus ? 'online' : 'offline' },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => {
//         this.isOnline = newStatus;
//         this.driverDetails.status = newStatus ? 'online' : 'offline';
//         this.message = `You are now ${this.isOnline ? 'online' : 'offline'}`;
        
//         if (this.isOnline) {
//           this.loadRideRequests();
//           this.startRequestPolling();
//         } else {
//           this.stopRequestPolling();
//           this.pendingRequests = [];
//           this.allRequests = [];
//         }
        
//         setTimeout(() => this.message = '', 3000);
//       },
//       error: (err) => {
//         console.error('Failed to update status via users endpoint:', err);
//         // Fallback: try drivers endpoint
//         this.http.patch(`http://127.0.0.1:42099/drivers/${this.driverDetails.driver_id}/status`, 
//           { status: newStatus ? 'online' : 'offline' },
//           { headers: { Authorization: `Bearer ${token}` } }
//         ).subscribe({
//           next: () => {
//             this.isOnline = newStatus;
//             this.driverDetails.status = newStatus ? 'online' : 'offline';
//             this.message = `You are now ${this.isOnline ? 'online' : 'offline'}`;
            
//             if (this.isOnline) {
//               this.loadRideRequests();
//               this.startRequestPolling();
//             } else {
//               this.stopRequestPolling();
//               this.pendingRequests = [];
//               this.allRequests = [];
//             }
            
//             setTimeout(() => this.message = '', 3000);
//           },
//           error: (err2) => {
//             console.error('Failed to update status via drivers endpoint:', err2);
//             this.error = 'Unable to update online status. Please try again.';
//           }
//         });
//       }
//     });
//   }

//   setActiveTab(tab: string) {
//     this.activeTab = tab;
//     this.message = '';
//     this.error = '';
//   }

//   setRidesSubTab(subTab: string) {
//     this.ridesSubTab = subTab;
//   }

//   setRequestsSubTab(subTab: string) {
//     this.requestsSubTab = subTab;
//   }

//   viewProfile() {
//     this.setActiveTab('profile');
//     this.showProfileMenu = false;
//   }

//   logout() {
//     if (confirm('Are you sure you want to logout?')) {
//       this.stopRequestPolling();
//       localStorage.removeItem('token');
//       localStorage.removeItem('driverDetails');
//       this.redirectToLogin();
//     }
//   }

//   private redirectToLogin() {
//     if (isPlatformBrowser(this.platformId)) {
//       window.location.href = '/login';
//     }
//   }

//   // Utility methods
//   getOriginStopName(stopId: string): string {
//     const stop = this.sourceStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
//     return stop ? (stop.name || stop.stop_name) : 'Unknown';
//   }

//   getDestinationStopName(stopId: string): string {
//     const stop = this.destStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
//     return stop ? (stop.name || stop.stop_name) : 'Unknown';
//   }

//   getStopName(stopId: string): string {
//     const stop = this.stops.find(s => s.stop_id == stopId);
//     return stop ? stop.stop_name : `Stop ${stopId}`;
//   }

//   formatTime(timeString: string): string {
//     const date = new Date(timeString);
//     return date.toLocaleString();
//   }

//   getRelativeTime(timeString: string): string {
//     const now = new Date();
//     const time = new Date(timeString);
//     const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours} hours ago`;
//     if (diffInHours < 48) return 'Yesterday';
//     return `${Math.floor(diffInHours / 24)} days ago`;
//   }

//   getCurrentRides(): Ride[] {
//     switch (this.ridesSubTab) {
//       case 'active': return this.activeRides;
//       case 'completed': return this.completedRides;
//       case 'cancelled': return this.cancelledRides;
//       default: return this.activeRides;
//     }
//   }

//   getCurrentRequests(): RideRequest[] {
//     switch (this.requestsSubTab) {
//       case 'pending': return this.pendingRequests;
//       case 'all': return this.allRequests;
//       default: return this.pendingRequests;
//     }
//   }
// }



















import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface Stop {
  id: string;
  name: string;
}

interface Ride {
  ride_id: number;
  origin_stop_id: number;
  destination_stop_id: number;
  departure_time: string;
  available_seats: number;
  status: string;
  created_at?: string;
  fare?: number;
  passenger_count?: number;
  origin_name?: string;
  destination_name?: string;
}

interface RideRequest {
  request_id: number;
  ride_id: number;
  rider_id: number;
  status: string;
  requested_at: string;
  ride?: {
    origin_name?: string;
    destination_name?: string;
    departure_time?: string;
    available_seats?: number;
  };
  rider?: {
    user_name?: string;
    phone?: string;
    rating?: number;
  };
}

interface DashboardStats {
  todayEarnings: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  rating: number;
  onlineHours: number;
}

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  stops: any[] = [];
  
  // Separate arrays for source and destination dropdowns
  sourceStops: Stop[] = [];
  destStops: Stop[] = [];
  
  driverDetails: any = {
    driver_id: '',
    driver_name: '',
    gender: '',
    phone: '',
    email: '',
    rating: 0,
    totalRides: 0,
    status: 'offline'
  };

  ride = {
    origin_stop_id: '',
    destination_stop_id: '',
    departure_time: '',
    available_seats: 1,
    route_id: '',
  };

  // Dashboard stats
  dashboardStats: DashboardStats = {
    todayEarnings: 0,
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    activeRides: 0,
    rating: 0,
    onlineHours: 0
  };

  // Rides data
  activeRides: Ride[] = [];
  completedRides: Ride[] = [];
  cancelledRides: Ride[] = [];
  recentRides: any[] = [];

  // Ride requests data
  pendingRequests: RideRequest[] = [];
  allRequests: RideRequest[] = [];
  newRequestsCount = 0;

  // UI state
  message = '';
  error = '';
  showProfileMenu = false;
  isOnline = false;
  activeTab = 'dashboard';
  ridesSubTab = 'active'; // for rides tab sub-navigation
  requestsSubTab = 'pending'; // for requests tab sub-navigation
  isLoading = false;
  showRequestNotification = false;

  // Polling for requests
  private requestPollingInterval: any;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStopsAndSources();
    this.loadDriverData();
    this.loadDashboardStats();
    this.loadDriverRides();
    this.startRequestPolling();
  }

  ngOnDestroy() {
    this.stopRequestPolling();
  }

  loadDriverData() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const driverId = decoded.sub?.user_id || decoded.user_id;
          
          if (driverId) {
            this.loadDriverDetails(driverId, token);
          } else {
            console.error('Driver ID not found in token');
            this.redirectToLogin();
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          this.redirectToLogin();
        }
      } else {
        console.error('No token found in localStorage');
        this.redirectToLogin();
      }
    }
  }

  loadDriverDetails(driverId: string, token: string) {
    this.http.get<any>(`http://127.0.0.1:42099/users/${driverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (driver) => {
        this.driverDetails.driver_id = driver.driver_id || driverId; // Ensure driver_id is set
        this.driverDetails.driver_name = driver.user_name;
        this.driverDetails.gender = driver.gender;
        this.driverDetails.phone = driver.phone || 'Not provided';
        this.driverDetails.email = driver.email || 'Not provided';
        this.driverDetails.status = driver.status || 'offline';
        this.isOnline = this.driverDetails.status === 'online';
        
        // Load rides after driver details are loaded
        this.loadDriverRides();
        this.loadDashboardStats();
        
        // Load ride requests if driver is online
        if (this.isOnline) {
          this.loadRideRequests();
        }
      },
      error: (err) => {
        console.error('Failed to load driver info:', err);
        this.error = 'Failed to load driver information';
      }
    });
  }

  loadStopsAndSources() {
    this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
      next: (stopsData) => {
        this.stops = Array.isArray(stopsData) ? stopsData : [];

        // Load source stops from route-stops/sources endpoint
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
            this.error = 'Failed to load source locations';
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch stops:', err);
        this.stops = [];
        this.error = 'Failed to load stops data';
      }
    });
  }

  onOriginStopChange() {
    // Reset destination selection when origin changes
    this.ride.destination_stop_id = '';
    this.destStops = [];

    if (this.ride.origin_stop_id) {
      this.http.get<any>('http://127.0.0.1:42099/route-stops/destinations', {
        params: new HttpParams().set('source_stop_id', this.ride.origin_stop_id)
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

          this.destStops = uniqueDestIds.map((stopId: string) => {
            const stopInfo = this.stops.find(s => String(s.stop_id) === stopId);
            return {
              id: stopId,
              name: stopInfo?.stop_name ?? `Stop ${stopId}`
            };
          });
        },
        error: (err) => {
          console.error('Failed to fetch destinations:', err);
          this.destStops = [];
          this.error = 'Failed to load destination options';
        }
      });
    }
  }

  // Load actual dashboard statistics
  loadDashboardStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Get driver's rides statistics
    this.http.get<any>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (stats) => {
        this.dashboardStats = {
          todayEarnings: stats.todayEarnings || 0,
          totalRides: stats.totalRides || 0,
          completedRides: stats.completedRides || 0,
          cancelledRides: stats.cancelledRides || 0,
          activeRides: stats.activeRides || 0,
          rating: stats.averageRating || 0,
          onlineHours: stats.onlineHours || 0
        };
      },
      error: (err) => {
        console.log('Stats API not available, using fallback method');
        this.calculateStatsFromRides();
      }
    });
  }

  // Fallback method to calculate stats from rides data
  calculateStatsFromRides() {
    const token = localStorage.getItem('token');
    if (!token || !this.driverDetails.driver_id) return;

    this.http.get<Ride[]>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (rides) => {
        const today = new Date().toDateString();
        
        this.dashboardStats = {
          totalRides: rides.length,
          completedRides: rides.filter(r => r.status === 'completed').length,
          cancelledRides: rides.filter(r => r.status === 'cancelled').length,
          activeRides: rides.filter(r => r.status === 'active').length,
          todayEarnings: rides
            .filter(r => r.status === 'completed' && new Date(r.departure_time).toDateString() === today)
            .reduce((sum, r) => sum + (r.fare || 0), 0),
          rating: this.driverDetails.rating || 0,
          onlineHours: 0 // This would need to be tracked separately
        };
      },
      error: (err) => {
        console.error('Failed to load rides for stats:', err);
        // Keep default values
      }
    });
  }

  // Load driver's rides
  loadDriverRides() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    if (!this.driverDetails.driver_id) {
      console.error('Driver ID not available yet');
      return;
    }
  
    this.http.get<Ride[]>(`http://127.0.0.1:42099/rides/driver/${this.driverDetails.driver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (rides) => {
        console.log('Received rides:', rides); // Debug log
        
        // Add stop names to rides
        const ridesWithNames = rides.map(ride => ({
          ...ride,
          origin_name: this.getStopName(ride.origin_stop_id.toString()),
          destination_name: this.getStopName(ride.destination_stop_id.toString())
        }));
  
        // Separate rides by status (case-insensitive)
        this.activeRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'active');
        this.completedRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'completed');
        this.cancelledRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'cancelled');
        
        console.log('Active rides:', this.activeRides); // Debug log
        
        // Recent rides (last 10 rides)
        this.recentRides = ridesWithNames
          .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
          .slice(0, 10)
          .map(ride => ({
            id: ride.ride_id,
            origin: ride.origin_name,
            destination: ride.destination_name,
            time: this.getRelativeTime(ride.departure_time),
            fare: ride.fare || 0,
            status: ride.status,
            rating: 0 // This would come from ratings table
          }));
      },
      error: (err) => {
        console.error('Failed to load driver rides:', err);
        this.error = 'Failed to load rides data';
      }
    });
  }

  // Load ride requests for the driver
  loadRideRequests() {
    const token = localStorage.getItem('token');
    if (!token || !this.driverDetails.driver_id) return;

    this.http.get<RideRequest[]>(`http://127.0.0.1:42099/ride-requests/driver/${this.driverDetails.driver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (requests) => {
        const previousPendingCount = this.pendingRequests.length;
        this.allRequests = requests;
        this.pendingRequests = requests.filter(r => r.status === 'Pending');
        
        // Check for new requests
        if (this.pendingRequests.length > previousPendingCount && previousPendingCount > 0) {
          this.newRequestsCount = this.pendingRequests.length - previousPendingCount;
          this.showRequestNotification = true;
          this.playNotificationSound();
          setTimeout(() => {
            this.showRequestNotification = false;
            this.newRequestsCount = 0;
          }, 5000);
        }
      },
      error: (err) => {
        console.error('Failed to load ride requests:', err);
      }
    });
  }

  // Start polling for ride requests
  startRequestPolling() {
    if (this.isOnline) {
      this.requestPollingInterval = setInterval(() => {
        this.loadRideRequests();
      }, this.POLLING_INTERVAL);
    }
  }

  // Stop polling for ride requests
  stopRequestPolling() {
    if (this.requestPollingInterval) {
      clearInterval(this.requestPollingInterval);
      this.requestPollingInterval = null;
    }
  }

  // Accept a ride request
  acceptRideRequest(requestId: number) {
    if (!confirm('Accept this ride request?')) return;

    const token = localStorage.getItem('token');
    this.http.patch(`http://127.0.0.1:42099/ride-requests/${requestId}`, 
      { status: 'Accepted' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.message = 'Ride request accepted successfully!';
        this.loadRideRequests();
        this.loadDriverRides();
        this.loadDashboardStats();
        
        // Send notification to rider
        const request = this.pendingRequests.find(r => r.request_id === requestId);
        if (request) {
          this.sendNotificationToRider(request.rider_id, 'Your ride request has been accepted!');
        }
      },
      error: (err) => {
        console.error('Failed to accept ride request:', err);
        this.error = 'Failed to accept ride request';
      }
    });
  }

  // Reject a ride request
  rejectRideRequest(requestId: number) {
    if (!confirm('Reject this ride request?')) return;

    const token = localStorage.getItem('token');
    this.http.patch(`http://127.0.0.1:42099/ride-requests/${requestId}`, 
      { status: 'Rejected' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.message = 'Ride request rejected';
        this.loadRideRequests();
        
        // Send notification to rider
        const request = this.pendingRequests.find(r => r.request_id === requestId);
        if (request) {
          this.sendNotificationToRider(request.rider_id, 'Your ride request has been rejected.');
        }
      },
      error: (err) => {
        console.error('Failed to reject ride request:', err);
        this.error = 'Failed to reject ride request';
      }
    });
  }

  // Send notification message to rider
  sendNotificationToRider(riderId: number, messageText: string) {
    const token = localStorage.getItem('token');
    const messageData = {
      sender_id: this.driverDetails.driver_id,
      receiver_id: riderId,
      message_text: messageText
    };

    this.http.post('http://127.0.0.1:42099/messages', messageData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log('Notification sent to rider');
      },
      error: (err) => {
        console.error('Failed to send notification:', err);
      }
    });
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeBC+J2fPCdSYEK4DL8NiKOAkasKjm7bJgGgU7k9n0unEpBSl8yO3eizEHHnPI7eeXSQwOUqjn77BdGAU9jNrsx2wgBCl+x+3fjzQHG3DF8eeSSgwKTqHh5KVlGgc4mtv0v2kfBit82e7elEMNE1qi5O2eSgoKTqHj5ahVFgtIqd3v1W8aBC16zNzYijMHG3DL8OOaUgsEVKjo1nIpBy16kNvzunUqBSp9yOzfhzEKGW/G7eSXTQsIS6Hl7aNcGgU8jNnuyWwgBCh9x+7ghzIKGXPI7+aVSQsLUKfn76hZFQlHpta0MnkfBCt8xO3bgjMJGnDI8eiSUgwJVKvp3ZlMEAhOo+PqnlgLBzGN2fXKfScBJ33H8dyPQgwSTKDi6alpHgc2k9n0w2sfBSl7zOzeiTcJGG+97d6ONggZdMLx14xADAhRpuHpqVAKDlap2urHfSwEB1Wk5Om0X'); 
      audio.play().catch(e => console.log('Could not play notification sound'));
    } catch (e) {
      console.log('Could not play notification sound');
    }
  }
  createRide() {
    this.error = '';
    this.message = '';
    this.isLoading = true;
  
    if (!this.ride.origin_stop_id || !this.ride.destination_stop_id || !this.ride.departure_time || !this.ride.available_seats) {
      this.error = 'Please fill all required fields.';
      this.isLoading = false;
      return;
    }
  
    if (this.ride.origin_stop_id === this.ride.destination_stop_id) {
      this.error = 'Origin and destination cannot be the same.';
      this.isLoading = false;
      return;
    }
  
    const departureDate = new Date(this.ride.departure_time);
    const now = new Date();
    
    if (departureDate <= now) {
      this.error = 'Departure time must be in the future.';
      this.isLoading = false;
      return;
    }
  
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const formattedDepartureTime = 
      `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())} ` +
      `${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:00`;
  
    const postData = {
      driver_id: this.driverDetails.driver_id,
      origin_stop_id: Number(this.ride.origin_stop_id),
      destination_stop_id: Number(this.ride.destination_stop_id),
      departure_time: formattedDepartureTime,
      available_seats: Number(this.ride.available_seats),
      route_id: this.ride.route_id ? Number(this.ride.route_id) : null,
      status: 'active'
    };
  
    const token = localStorage.getItem('token');
    
    this.http.post('http://127.0.0.1:42099/rides', postData, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (response) => {
        console.log('Ride created successfully:', response); // Debug log
        this.message = 'Ride created successfully! Passengers can now book your ride.';
        this.error = '';
        this.resetForm();
        this.isLoading = false;
        
        // Refresh data - with small delay to ensure backend has processed
        setTimeout(() => {
          this.loadDriverRides();
          this.loadDashboardStats();
        }, 500);
        
        // Switch to active rides tab to show the new ride
        this.activeTab = 'rides';
        this.ridesSubTab = 'active';
      },
      error: err => {
        console.error('Failed to create ride:', err);
        this.error = 'Failed to create ride. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Cancel a ride
  cancelRide(rideId: number) {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    const token = localStorage.getItem('token');
    this.http.patch(`http://127.0.0.1:42099/rides/${rideId}`, 
      { status: 'cancelled' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.message = 'Ride cancelled successfully';
        this.loadDriverRides();
        this.loadDashboardStats();
      },
      error: (err) => {
        console.error('Failed to cancel ride:', err);
        this.error = 'Failed to cancel ride';
      }
    });
  }

  // Complete a ride
  completeRide(rideId: number) {
    if (!confirm('Mark this ride as completed?')) return;

    const token = localStorage.getItem('token');
    this.http.patch(`http://127.0.0.1:42099/rides/${rideId}`, 
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.message = 'Ride marked as completed';
        this.loadDriverRides();
        this.loadDashboardStats();
      },
      error: (err) => {
        console.error('Failed to complete ride:', err);
        this.error = 'Failed to complete ride';
      }
    });
  }

  resetForm() {
    this.ride = {
      origin_stop_id: '',
      destination_stop_id: '',
      departure_time: '',
      available_seats: 1,
      route_id: '',
    };
    this.destStops = [];
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  // Fixed online/offline toggle
  toggleOnlineStatus() {
    const newStatus = !this.isOnline;
    const token = localStorage.getItem('token');
    
    if (!token || !this.driverDetails.driver_id) {
      this.error = 'Unable to update status. Please try logging in again.';
      return;
    }

    // Try updating driver status via users endpoint
    this.http.patch(`http://127.0.0.1:42099/users/${this.driverDetails.driver_id}`, 
      { status: newStatus ? 'online' : 'offline' },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.isOnline = newStatus;
        this.driverDetails.status = newStatus ? 'online' : 'offline';
        this.message = `You are now ${this.isOnline ? 'online' : 'offline'}`;
        
        if (this.isOnline) {
          this.loadRideRequests();
          this.startRequestPolling();
        } else {
          this.stopRequestPolling();
          this.pendingRequests = [];
          this.allRequests = [];
        }
        
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Failed to update status via users endpoint:', err);
        // Fallback: try drivers endpoint
        this.http.patch(`http://127.0.0.1:42099/drivers/${this.driverDetails.driver_id}/status`, 
          { status: newStatus ? 'online' : 'offline' },
          { headers: { Authorization: `Bearer ${token}` } }
        ).subscribe({
          next: () => {
            this.isOnline = newStatus;
            this.driverDetails.status = newStatus ? 'online' : 'offline';
            this.message = `You are now ${this.isOnline ? 'online' : 'offline'}`;
            
            if (this.isOnline) {
              this.loadRideRequests();
              this.startRequestPolling();
            } else {
              this.stopRequestPolling();
              this.pendingRequests = [];
              this.allRequests = [];
            }
            
            setTimeout(() => this.message = '', 3000);
          },
          error: (err2) => {
            console.error('Failed to update status via drivers endpoint:', err2);
            this.error = 'Unable to update online status. Please try again.';
          }
        });
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.message = '';
    this.error = '';
  }

  setRidesSubTab(subTab: string) {
    this.ridesSubTab = subTab;
  }

  setRequestsSubTab(subTab: string) {
    this.requestsSubTab = subTab;
  }

  viewProfile() {
    this.setActiveTab('profile');
    this.showProfileMenu = false;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.stopRequestPolling();
      localStorage.removeItem('token');
      localStorage.removeItem('driverDetails');
      this.redirectToLogin();
    }
  }

  private redirectToLogin() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/login';
    }
  }

  // Utility methods
  getOriginStopName(stopId: string): string {
    const stop = this.sourceStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
    return stop ? (stop.name || stop.stop_name) : 'Unknown';
  }

  getDestinationStopName(stopId: string): string {
    const stop = this.destStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
    return stop ? (stop.name || stop.stop_name) : 'Unknown';
  }

  getStopName(stopId: string): string {
    const stop = this.stops.find(s => s.stop_id == stopId);
    return stop ? stop.stop_name : `Stop ${stopId}`;
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleString();
  }

  getRelativeTime(timeString: string): string {
    const now = new Date();
    const time = new Date(timeString);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  getCurrentRides(): Ride[] {
    switch (this.ridesSubTab) {
      case 'active': return this.activeRides;
      case 'completed': return this.completedRides;
      case 'cancelled': return this.cancelledRides;
      default: return this.activeRides;
    }
  }

  getCurrentRequests(): RideRequest[] {
    switch (this.requestsSubTab) {
      case 'pending': return this.pendingRequests;
      case 'all': return this.allRequests;
      default: return this.pendingRequests;
    }
  }
  
}