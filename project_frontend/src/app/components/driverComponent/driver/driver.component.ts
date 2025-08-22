import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DriverService } from '../../../services/driver.service';
import { RideRequestService } from '../../../services/rideRequests.service';
import { RideService } from '../../../services/ride.service';
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
  activeRides: any[] = [];
  pendingRequests: any[] = [];

  showProfileMenu = false;
  showRequestNotification = false;
  newRequestsCount = 0;
  private previousRequestCount = 0;

  private pollingInterval: any;
  private messageTimeout: any;
  private errorTimeout: any;
  private notificationTimeout: any;

  constructor(
    private driverService: DriverService,
    private rideRequestService: RideRequestService,
    private rideService: RideService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.loadDriverData();
    this.startDataPolling();
  }

  ngOnDestroy() {
    this.stopDataPolling();
    this.clearTimeouts();
    this.rideRequestService.stopRequestPolling();
  }

  private startDataPolling() {
    this.pollingInterval = setInterval(() => {
      this.updateAllData();
    }, 1000);
  }

  private stopDataPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private clearTimeouts() {
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
  }

  private updateAllData() {
    this.updateDriverDetails();
    this.updateActiveRides();
    this.handleNewRequests();
    this.handleMessages();
    this.handleErrors();
  }

  private updateDriverDetails() {
    this.driverDetails = this.driverService.driverDetails;
  }

  private updateActiveRides() {
    this.activeRides = this.rideService.activeRides;
  }

  private handleNewRequests() {
    const currentRequests = this.rideRequestService.pendingRequests;
    this.pendingRequests = currentRequests;

    if (currentRequests.length > this.previousRequestCount && this.previousRequestCount > 0) {
      this.newRequestsCount = currentRequests.length - this.previousRequestCount;
      this.showRequestNotification = true;
      this.driverService.playNotificationSound();

      if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
      this.notificationTimeout = setTimeout(() => {
        this.showRequestNotification = false;
        this.newRequestsCount = 0;
      }, 5000);
    }
    this.previousRequestCount = currentRequests.length;
  }

  private handleMessages() {
    const currentMessage = this.driverService.message;
    if (currentMessage && currentMessage !== this.message) {
      this.message = currentMessage;
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.driverService.setMessage('');
        this.message = '';
      }, 3000);
    } else if (!currentMessage && this.message) {
      this.message = '';
    }
  }

  private handleErrors() {
    const currentError = this.driverService.error;
    if (currentError && currentError !== this.error) {
      this.error = currentError;
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      this.errorTimeout = setTimeout(() => {
        this.driverService.setError('');
        this.error = '';
      }, 5000);
    } else if (!currentError && this.error) {
      this.error = '';
    }
  }

  private loadDriverData() {
    this.driverService.loadDriverData()
      .then(() => {
        this.updateAllData();
        if (this.driverService.isOnline) {
          this.rideRequestService.startRequestPolling();
        }

        this.rideService.loadDriverRides().subscribe({
          next: rides => console.log('Active rides loaded:', rides),
          error: err => console.error('Failed to load active rides:', err)
        });
      })
      .catch(error => {
        console.error('Failed to load driver data:', error);
        this.redirectToLogin();
      });
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  viewProfile(event: Event): void {
    event.preventDefault(); 
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

  closeRequestNotification() {
    this.showRequestNotification = false;
  }

  isActiveRoute(route: string): boolean {
    if (route === '/driver') {
      return this.router.url === '/driver' || this.router.url === '/driver/';
    }
    return this.router.url.startsWith(route);
  }
}