import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { DriverService } from '../../../services/driver.service';
import { RideRequestService } from '../../../services/rideRequests.service';
import { RideService } from '../../../services/ride.service'; // Add this import if available
import { DriverSideBarComponent } from '../driver-side-bar/driver-side-bar.component';

@Component({
  selector: 'app-driver-layout',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DriverSideBarComponent]
})
export class DriverComponent implements OnInit, OnDestroy {
  driverDetails: any = {};
  isOnline = false;
  message = '';
  error = '';
  showProfileMenu = false;
  activeRides: any[] = [];
  pendingRequests: any[] = [];
  newRequestsCount = 0;
  showRequestNotification = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideRequestService: RideRequestService,
    private rideService: RideService, // Add this if available
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.rideRequestService.stopRequestPolling();
  }

  private initializeComponent() {
    // Load driver data
    this.driverService.loadDriverData().then(() => {
      // Start polling if online
      if (this.driverService.isOnline) {
        this.rideRequestService.startRequestPolling();
      }
      // Load active rides
      this.loadActiveRides();
    }).catch(error => {
      console.error('Failed to load driver data:', error);
      this.redirectToLogin();
    });
  }

  private setupSubscriptions() {
    // Subscribe to driver details
    this.subscriptions.push(
      this.driverService.driverDetails$.subscribe(details => {
        this.driverDetails = details;
      })
    );

    // Subscribe to online status
    this.subscriptions.push(
      this.driverService.isOnline$.subscribe(isOnline => {
        this.isOnline = isOnline;
        if (isOnline) {
          this.rideRequestService.startRequestPolling();
        } else {
          this.rideRequestService.stopRequestPolling();
        }
      })
    );

    // Subscribe to messages
    this.subscriptions.push(
      this.driverService.message$.subscribe(message => {
        this.message = message;
        if (message) {
          setTimeout(() => this.driverService.setMessage(''), 3000);
        }
      })
    );

    // Subscribe to errors
    this.subscriptions.push(
      this.driverService.error$.subscribe(error => {
        this.error = error;
        if (error) {
          setTimeout(() => this.driverService.setError(''), 5000);
        }
      })
    );

    // Subscribe to pending requests for badge count
    this.subscriptions.push(
      this.rideRequestService.pendingRequests$.subscribe(requests => {
        const previousCount = this.pendingRequests.length;
        this.pendingRequests = requests;
        
        // Show notification for new requests
        if (requests.length > previousCount && previousCount > 0) {
          this.newRequestsCount = requests.length - previousCount;
          this.showRequestNotification = true;
          this.driverService.playNotificationSound();
          
          setTimeout(() => {
            this.showRequestNotification = false;
            this.newRequestsCount = 0;
          }, 5000);
        }
      })
    );

    // Subscribe to active rides if RideService is available
    if (this.rideService) {
      this.subscriptions.push(
        this.rideService.activeRides$.subscribe(rides => {
          this.activeRides = rides;
        })
      );
    }
  }

  // Load active rides data
  private loadActiveRides() {
    if (this.rideService) {
      this.rideService.loadDriverRides().subscribe({
        next: (rides) => {
          console.log('Active rides loaded:', rides);
        },
        error: (err) => {
          console.error('Failed to load active rides:', err);
        }
      });
    }
  }

  // Check if current route is active
  isActiveRoute(route: string): boolean {
    if (route === '/driver') {
      return this.router.url === '/driver' || this.router.url === '/driver/';
    }
    return this.router.url.startsWith(route);
  }

  // Toggle online/offline status
  toggleOnlineStatus() {
    this.driverService.toggleOnlineStatus().subscribe({
      next: (isOnline) => {
        // Status updated successfully
        if (!isOnline) {
          // Clear requests when going offline
          this.pendingRequests = [];
        }
      },
      error: (err) => {
        console.error('Failed to toggle online status:', err);
      }
    });
  }

  // Profile menu methods
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  viewProfile() {
    this.router.navigate(['/driver/profile']);
    this.showProfileMenu = false;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.rideRequestService.stopRequestPolling();
      localStorage.removeItem('token');
      localStorage.removeItem('driverDetails');
      this.redirectToLogin();
    }
  }

  private redirectToLogin() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

  // Close notification
  closeRequestNotification() {
    this.showRequestNotification = false;
  }
}