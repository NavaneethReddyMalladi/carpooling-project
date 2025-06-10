import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface Stop {
  id: string;
  name: string;
}

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DriverDashboardComponent implements OnInit {
  stops: any[] = [];
  
  // NEW: Separate arrays for source and destination dropdowns
  sourceStops: Stop[] = [];
  destStops: Stop[] = [];
  
  driverDetails: any = {
    driver_id: '',
    driver_name: '',
    gender: '',
    phone: '',
    email: '',
    rating: 4.5,
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
  dashboardStats = {
    todayEarnings: 0,
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    rating: 4.5,
    onlineHours: 0
  };

  // Recent rides
  recentRides: any[] = [];

  // UI state
  message = '';
  error = '';
  showProfileMenu = false;
  isOnline = false;
  activeTab = 'dashboard';
  isLoading = false;

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStopsAndSources(); // Updated method name
    this.loadDriverData();
    this.loadDashboardStats();
    this.loadRecentRides();
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
        this.driverDetails.driver_id = driver.driver_id;
        this.driverDetails.driver_name = driver.user_name;
        this.driverDetails.gender = driver.gender;
        this.driverDetails.phone = driver.phone || 'Not provided';
        this.driverDetails.email = driver.email || 'Not provided';
        this.driverDetails.status = driver.status || 'offline';
        this.isOnline = this.driverDetails.status === 'online';
      },
      error: (err) => {
        console.error('Failed to load driver info:', err);
        this.error = 'Failed to load driver information';
      }
    });
  }

  // UPDATED: Load stops and sources using the same pattern as rider dashboard
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

  // UPDATED: Handle origin stop change using the same logic as rider dashboard
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

  loadDashboardStats() {
    // Mock data - replace with actual API calls
    this.dashboardStats = {
      todayEarnings: 1250,
      totalRides: 247,
      completedRides: 235,
      cancelledRides: 12,
      rating: 4.7,
      onlineHours: 8.5
    };
  }

  loadRecentRides() {
    // Mock data - replace with actual API calls
    this.recentRides = [
      {
        id: 1,
        origin: 'Central Station',
        destination: 'Airport',
        time: '2 hours ago',
        fare: 450,
        status: 'completed',
        rating: 5
      },
      {
        id: 2,
        origin: 'Mall',
        destination: 'University',
        time: '5 hours ago',
        fare: 280,
        status: 'completed',
        rating: 4
      },
      {
        id: 3,
        origin: 'Hospital',
        destination: 'Market',
        time: 'Yesterday',
        fare: 320,
        status: 'cancelled',
        rating: 0
      }
    ];
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
      status: 'Active'
    };

    const token = localStorage.getItem('token');
    
    this.http.post('http://127.0.0.1:42099/rides', postData, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.message = 'Ride created successfully! Passengers can now book your ride.';
        this.error = '';
        this.resetForm();
        this.isLoading = false;
        // Refresh dashboard stats
        this.loadDashboardStats();
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to create ride. Please try again.';
        this.isLoading = false;
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
    // Reset destination stops when form is reset
    this.destStops = [];
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
    this.driverDetails.status = this.isOnline ? 'online' : 'offline';
    
    // Update status on server
    const token = localStorage.getItem('token');
    if (token) {
      this.http.patch(`http://127.0.0.1:42099/drivers/${this.driverDetails.driver_id}/status`, 
        { status: this.driverDetails.status },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: () => {
          this.message = `You are now ${this.isOnline ? 'online' : 'offline'}`;
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          console.error('Failed to update status:', err);
          // Revert the toggle if API call fails
          this.isOnline = !this.isOnline;
          this.driverDetails.status = this.isOnline ? 'online' : 'offline';
        }
      });
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.message = '';
    this.error = '';
  }

  viewProfile() {
    this.setActiveTab('profile');
    this.showProfileMenu = false;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
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

  // UPDATED: Utility methods using the new stop arrays
  getOriginStopName(stopId: string): string {
    const stop = this.sourceStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
    return stop ? (stop.name || stop.stop_name) : 'Unknown';
  }

  getDestinationStopName(stopId: string): string {
    const stop = this.destStops.find(s => s.id == stopId) || this.stops.find(s => s.stop_id == stopId);
    return stop ? (stop.name || stop.stop_name) : 'Unknown';
  }

  // NEW: Method to get stop name by ID (similar to rider dashboard)
  getStopName(stopId: string): string {
    const stop = this.stops.find(s => s.stop_id === stopId);
    return stop ? stop.stop_name : `Stop ${stopId}`;
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleString();
  }
}