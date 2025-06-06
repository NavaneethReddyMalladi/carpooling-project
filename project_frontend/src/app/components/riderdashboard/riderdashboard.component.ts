// import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import {jwtDecode} from 'jwt-decode';


// @Component({
//   selector: 'app-rider-dashboard',
//   templateUrl: './riderdashboard.component.html',
//   styleUrls: ['./riderdashboard.component.css'],
//   standalone: true,
//   imports: [CommonModule, FormsModule]
// })
// export class RiderDashboardComponent implements OnInit {
//   sourceStops: any[] = [];
//   destStops: any[] = [];
//   rides: any[] = [];
//   selectedRide: any = null;

//   selectedSource = '';
//   selectedDest = '';
//   currentUser: any;

//   stops: any[] = [];

//   riderDetails: any = {
//     rider_name: '',
//     rider_id: '',
//     start_stop_id: '',
//     destination_stop_id: '',
//     gender: ''
//   };
  
//   constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

//   ngOnInit() {
//     this.loadStopsAndSources();

//     if (isPlatformBrowser(this.platformId)) {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const decoded: any = jwtDecode(token);
//         const riderId = decoded.sub?.user_id || decoded.user_id;  // adapt this key based on your token structure
//         // console.log(decoded)
//         // console.log(riderId)
//         if (riderId) {
//           this.loadRiderDetails(riderId, token);

//         } else {
//           console.error('User ID not found in token');
//         }
//       } else {
//         console.error('No token found in localStorage');
//       }
//     }
//   }

//   loadRiderDetails(riderId: string, token: string) {
//     this.http.get<any>(`http://127.0.0.1:42099/users/${riderId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }).subscribe({
//       next: (rider) => {
//         this.riderDetails.rider_id = rider.user_id;
//         this.riderDetails.rider_name = rider.user_name;
//         this.riderDetails.gender = rider.gender;
        
//       },
//       error: (err) => {
//         console.error('Failed to load rider info:', err);
//       }
//     });
//   }

//   bookRide(ride: any) {
//     this.selectedRide = ride;
//     this.riderDetails.start_stop_id = ride.origin_stop_id;
//     this.riderDetails.destination_stop_id = ride.destination_stop_id;
//   }

//   loadStopsAndSources() {
//     this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
//       next: (stopsData) => {
//         this.stops = Array.isArray(stopsData) ? stopsData : [];

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
//           }
//         });
//       },
//       error: (err) => {
//         console.error('Failed to fetch stops:', err);
//         this.stops = [];
//       }
//     });
//   }

//   onSourceChange() {
//     this.selectedDest = '';
//     this.destStops = [];
//     this.rides = [];

//     if (this.selectedSource) {
//       this.http.get<any>('http://127.0.0.1:42099/route-stops/destinations', {
//         params: new HttpParams().set('source_stop_id', this.selectedSource)
//       }).subscribe({
//         next: (destResponse) => {
//           let destinations = [];

//           if (Array.isArray(destResponse)) {
//             destinations = destResponse;
//           } else if (Array.isArray(destResponse.destinations)) {
//             destinations = destResponse.destinations;
//           }

//           const uniqueDestIds = [...new Set(destinations.map((dest: any) => dest.stop_id || dest.end_stop_id))];

//           this.destStops = uniqueDestIds.map(stopId => {
//             const stopInfo = this.stops.find(s => s.stop_id === stopId);
//             return {
//               id: stopId,
//               name: stopInfo ? stopInfo.stop_name : `Stop ${stopId}`
//             };
//           });
//         },
//         error: (err) => {
//           console.error('Failed to fetch destinations:', err);
//           this.destStops = [];
//         }
//       });
//     }
//   }

//   searchRides() {
//     if (this.selectedSource && this.selectedDest) {
//       const params = new HttpParams()
//         .set('origin_stop_id', this.selectedSource)
//         .set('destination_stop_id', this.selectedDest);

//       this.http.get<any[]>('http://127.0.0.1:42099/rides/search', { params }).subscribe({
//         next: (data) => {
//           this.rides = Array.isArray(data) ? data : [];
//         },
//         error: (err) => {
//           console.error('Failed to fetch rides:', err);
//           this.rides = [];
//         }
//       });
//     }
//   }
// }







// import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { jwtDecode } from 'jwt-decode';

// interface Stop {
//   stop_id: number;
//   stop_name: string;
// }

// interface Ride {
//   ride_id: number;
//   driver_id: number;
//   driver_name: string;
//   origin_stop_id: number;
//   destination_stop_id: number;
//   route_id: number;
//   departure_time: string;
//   available_seats: number;
//   status: string;
//   origin_name?: string;
//   destination_name?: string;
//   distance?: number;
//   cost?: number;
//   estimated_time?: string;
// }

// interface RiderDetails {
//   rider_name: string;
//   rider_id: string;
//   user_id: string;
//   gender: string;
// }

// @Component({
//   selector: 'app-rider-dashboard',
//   templateUrl: './riderdashboard.component.html',
//   styleUrls: ['./riderdashboard.component.css'],
//   standalone: true,
//   imports: [CommonModule, FormsModule]
// })
// export class RiderDashboardComponent implements OnInit {
//   sourceStops: Stop[] = [];
//   destStops: Stop[] = [];
//   availableRides: Ride[] = [];
//   selectedRide: Ride | null = null;
  
//   selectedSource = '';
//   selectedDest = '';
//   currentRider: RiderDetails | null = null;
  
//   isLoading = false;
//   showBookingModal = false;

//   constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

//   ngOnInit() {
//     this.loadStopsAndSources();
//     this.loadRiderProfile();
//   }

//   loadRiderProfile() {
//     if (isPlatformBrowser(this.platformId)) {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const decoded: any = jwtDecode(token);
//         const userId = decoded.sub?.user_id || decoded.user_id;
        
//         if (userId) {
//           this.loadRiderDetails(userId, token);
//         } else {
//           console.error('User ID not found in token');
//         }
//       } else {
//         console.error('No token found in localStorage');
//       }
//     }
//   }

//   loadRiderDetails(userId: string, token: string) {
//     this.http.get<any>(`http://127.0.0.1:42099/users/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).subscribe({
//       next: (user) => {
//         this.currentRider = {
//           rider_id: user.user_id,
//           rider_name: user.user_name,
//           user_id: user.user_id,
//           gender: user.gender
//         };
//       },
//       error: (err) => console.error('Failed to load rider info:', err)
//     });
//   }

//   loadStopsAndSources() {
//     this.http.get<Stop[]>('http://127.0.0.1:42099/route-stops/sources').subscribe({
//       next: (sourcesData) => {
//         this.sourceStops = sourcesData.map(stop => ({
//           stop_id: stop.stop_id,
//           stop_name: stop.stop_name
//         }));
//       },
//       error: (err) => {
//         console.error('Failed to fetch sources:', err);
//         this.sourceStops = [];
//       }
//     });
//   }

//   onSourceChange() {
//     this.selectedDest = '';
//     this.destStops = [];
//     this.availableRides = [];

//     if (this.selectedSource) {
//       this.http.get<any>('http://127.0.0.1:42099/route-stops/destinations', {
//         params: new HttpParams().set('source_stop_id', this.selectedSource)
//       }).subscribe({
//         next: (destResponse) => {
//           let destinations = [];
//           if (Array.isArray(destResponse)) {
//             destinations = destResponse;
//           } else if (Array.isArray(destResponse.destinations)) {
//             destinations = destResponse.destinations;
//           }

//           this.destStops = destinations.map((dest: any) => ({
//             stop_id: dest.stop_id || dest.end_stop_id,
//             stop_name: dest.stop_name || `Stop ${dest.stop_id || dest.end_stop_id}`
//           }));
//         },
//         error: (err) => {
//           console.error('Failed to fetch destinations:', err);
//           this.destStops = [];
//         }
//       });
//     }
//   }

//   searchRides() {
//     if (this.selectedSource && this.selectedDest) {
//       this.isLoading = true;
//       const params = new HttpParams()
//         .set('origin_stop_id', this.selectedSource)
//         .set('destination_stop_id', this.selectedDest);

//       this.http.get<Ride[]>('http://127.0.0.1:42099/rides/search', { params }).subscribe({
//         next: (rides) => {
//           this.availableRides = rides;
//           this.enrichRidesWithStopNames();
//           this.isLoading = false;
//         },
//         error: (err) => {
//           console.error('Failed to fetch rides:', err);
//           this.availableRides = [];
//           this.isLoading = false;
//         }
//       });
//     }
//   }

//   enrichRidesWithStopNames() {
//     this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
//       next: (stops) => {
//         this.availableRides = this.availableRides.map(ride => {
//           const originStop = stops.find(s => s.stop_id === ride.origin_stop_id);
//           const destStop = stops.find(s => s.stop_id === ride.destination_stop_id);
          
//           return {
//             ...ride,
//             origin_name: originStop?.stop_name || 'Unknown',
//             destination_name: destStop?.stop_name || 'Unknown'
//           };
//         });
//       },
//       error: (err) => console.error('Failed to load stops:', err)
//     });
//   }

//   bookRide(ride: Ride) {
//     this.selectedRide = ride;
//     this.showBookingModal = true;
//   }

//   confirmBooking() {
//     if (!this.selectedRide || !this.currentRider) return;

//     const bookingData = {
//       rider_id: this.currentRider.rider_id,
//       ride_id: this.selectedRide.ride_id,
//       start_stop_id: this.selectedRide.origin_stop_id,
//       destination_stop_id: this.selectedRide.destination_stop_id,
//       status: 'Confirmed'
//     };

//     this.http.post('http://127.0.0.1:42099/bookings', bookingData).subscribe({
//       next: (response) => {
//         console.log('Booking confirmed:', response);
//         this.showBookingModal = false;
//         this.selectedRide = null;
//         // Refresh rides to update available seats
//         this.searchRides();
//       },
//       error: (err) => {
//         console.error('Failed to book ride:', err);
//       }
//     });
//   }

//   closeBookingModal() {
//     this.showBookingModal = false;
//     this.selectedRide = null;
//   }

//   formatDateTime(dateTime: string): string {
//     return new Date(dateTime).toLocaleString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   formatTime(dateTime: string): string {
//     return new Date(dateTime).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   formatDate(dateTime: string): string {
//     return new Date(dateTime).toLocaleDateString('en-US', {
//       month: 'numeric',
//       day: 'numeric',
//       year: '2-digit'
//     });
//   }
// }



























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
  rider_name: string;
  rider_id: string;
  start_stop_id: string;
  destination_stop_id: string;
  gender: string;
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

  // NEW: Profile menu state
  isProfileMenuOpen = false;

  riderDetails: RiderDetails = {
    rider_name: '',
    rider_id: '',
    start_stop_id: '',
    destination_stop_id: '',
    gender: ''
  };
  
  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  // navigateToPublish(){
  //   this.router.navigate(['/publish'])
  // }

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

    // API call to book the ride
    this.http.post('http://127.0.0.1:42099/ride-requests', bookingData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        this.showMessage('Ride booked successfully!', 'success');
        this.closeBookingModal();
        this.searchRides(); // Refresh the rides list
        this.isBooking = false;
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

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // NEW: Profile menu methods
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }
  

  manageAccount() {
    this.closeProfileMenu();
    const token = localStorage.getItem('token');
    if (!token) {
      this.showMessage('Authentication required. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }
  
    // Assuming rider_id is already known in riderDetails
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
          rider_name: data.user_name || data.name || '',
          start_stop_id: data.start_stop_id || '',
          destination_stop_id: data.destination_stop_id || '',
          gender: data.gender || ''
        };
        this.isEditingProfile = false;
      },
      error: (err) => {
        console.error('Failed to load rider details:', err);
        this.showMessage('Failed to load account details', 'error');
      }
    });
  }
  
  // Called on Edit button click
  editProfile() {
    this.isEditingProfile = true;
  }
  
  // Called on Save button click
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
  
    // Prepare the payload to update rider info (adjust as per your API)
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
        this.manageAccount(); // Reload fresh data after update
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.showMessage('Failed to update profile', 'error');
      }
    });
  }
  
  // Optional: Cancel editing to revert back
  cancelEdit() {
    this.isEditingProfile = false;
    this.manageAccount();
  }

  viewRides() {
    console.log('Navigate to view rides');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/my-rides']);
  }

  driveAndDeliver() {
    console.log('Navigate to drive & deliver');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/drive-deliver']);
  }

  openUberEats() {
    console.log('Navigate to Uber Eats');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/uber-eats']);
  }

  openUberBusiness() {
    console.log('Navigate to Uber for Business');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/uber-business']);
  }

  openHelp() {
    console.log('Navigate to help');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/help']);
  }

  openWallet() {
    console.log('Navigate to wallet');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/wallet']);
  }

  openActivity() {
    console.log('Navigate to activity');
    this.closeProfileMenu();
    // Add your navigation logic here
    // this.router.navigate(['/activity']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}