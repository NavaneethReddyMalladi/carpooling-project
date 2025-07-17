import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DriverService, RideRequest } from '../../../services/driver.service';
import { RideRequestService } from '../../../services/rideRequests.service';

@Component({
  selector: 'app-ride-requests',
  templateUrl: './driver-ride-requests.component.html',
  styleUrls: ['./driver-ride-requests.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class RideRequestsComponent implements OnInit, OnDestroy {
  pendingRequests: RideRequest[] = [];
  allRequests: RideRequest[] = [];
  requestsSubTab = 'pending';

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideRequestService: RideRequestService
  ) {}

  ngOnInit() {
    this.loadRequests();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to pending requests
    this.subscriptions.push(
      this.rideRequestService.pendingRequests$.subscribe(requests => {
        this.pendingRequests = requests;
      })
    );

    // Subscribe to all requests
    this.subscriptions.push(
      this.rideRequestService.allRequests$.subscribe(requests => {
        this.allRequests = requests;
      })
    );
  }

  private loadRequests() {
    this.rideRequestService.loadRideRequests().subscribe({
      next: (requests) => {
        console.log('Ride requests loaded:', requests.length);
      },
      error: (err) => {
        console.error('Failed to load ride requests:', err);
      }
    });
  }

  setRequestsSubTab(subTab: string) {
    this.requestsSubTab = subTab;
  }

  acceptRideRequest(requestId: number) {
    if (!confirm('Accept this ride request?')) return;

    this.rideRequestService.acceptRideRequest(requestId).subscribe({
      next: () => {
        console.log('Ride request accepted successfully');
      },
      error: (err) => {
        console.error('Failed to accept ride request:', err);
      }
    });
  }

  rejectRideRequest(requestId: number) {
    if (!confirm('Reject this ride request?')) return;

    this.rideRequestService.rejectRideRequest(requestId).subscribe({
      next: () => {
        console.log('Ride request rejected successfully');
      },
      error: (err) => {
        console.error('Failed to reject ride request:', err);
      }
    });
  }

  formatTime(timeString: string): string {
    return this.driverService.formatTime(timeString);
  }
}