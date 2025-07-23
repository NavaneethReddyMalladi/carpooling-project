import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RiderService, RideRequest } from '../../../services/rider.service';
import { ChatService } from '../../../services/riderchat.service';
import { Subscription } from 'rxjs';

interface BookedRide {
  id: string;
  booking_id?: string;
  request_id: number;
  ride_id: number;
  driver_id: string;
  driver_name: string;
  driver_phone?: string;
  origin_stop_id: string;
  destination_stop_id: string;
  departure_time: string;
  seats_booked?: number;
  available_seats?: number;
  price?: number;
  status: string;
  requested_at: string;
  cancellation_reason?: string;
}

@Component({
  selector: 'app-rider-myrides',
  templateUrl: './rider-my-rides.component.html',
  styleUrls: ['./rider-my-rides.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RiderMyRidesComponent implements OnInit, OnDestroy {
  activeTab = 'upcoming';
  upcomingRides: BookedRide[] = [];
  completedRides: BookedRide[] = [];
  cancelledRides: BookedRide[] = [];

  private subscriptions: Subscription[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private riderService: RiderService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.riderService.riderDetails?.rider_id) {
      this.riderService.loadRiderData().then(() => {
        this.loadRides();
      }).catch(err => {
        this.errorMessage = 'You must be logged in to view your ride requests.';
        this.riderService.showMessage(this.errorMessage, 'error');
      });
    } else {
      this.loadRides();
    }
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadRides() {
    this.isLoading = true;

    const riderId = this.riderService.riderDetails?.rider_id;
    const token = localStorage.getItem('token');

    if (!riderId || !token) {
      this.errorMessage = 'You must be logged in to view your ride requests.';
      this.riderService.showMessage(this.errorMessage, 'error');
      this.isLoading = false;

      // Prevent ExpressionChangedAfterItHasBeenCheckedError
      this.cdr.detectChanges();
      return;
    }

    const sub = this.riderService.loadRiderRequests().subscribe({
      next: (requests: RideRequest[]) => {
        this.processRideRequests(requests);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load ride requests:', error);
        this.riderService.showMessage('Failed to load your rides', 'error');
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  private processRideRequests(requests: RideRequest[]) {
    this.upcomingRides = [];
    this.completedRides = [];
    this.cancelledRides = [];

    requests.forEach(request => {
      const bookedRide: BookedRide = {
        id: request.request_id.toString(),
        request_id: request.request_id,
        ride_id: request.ride_id,
        booking_id: request.request_id.toString(),
        driver_id: String(request.driver.driver_id),
        driver_name: request.driver.driver_name,
        driver_phone: request.driver.phone,
        origin_stop_id: request.ride.origin_stop_id,
        destination_stop_id: request.ride.destination_stop_id,
        departure_time: request.ride.departure_time,
        available_seats: request.ride.available_seats,
        price: request.ride.price,
        status: request.status,
        requested_at: request.requested_at,
        seats_booked: 1
      };

      switch (request.status.toLowerCase()) {
        case 'pending':
        case 'accepted':
          this.upcomingRides.push(bookedRide);
          break;
        case 'completed':
          this.completedRides.push(bookedRide);
          break;
        case 'cancelled':
        case 'rejected':
          bookedRide.cancellation_reason = request.status === 'rejected'
            ? 'Rejected by driver'
            : 'Cancelled by rider';
          this.cancelledRides.push(bookedRide);
          break;
        default:
          this.upcomingRides.push(bookedRide);
      }
    });

    this.upcomingRides.sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime());
    this.completedRides.sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime());
    this.cancelledRides.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  contactDriver(ride: BookedRide) {
    if (!ride.driver_id || !ride.driver_name) {
      this.riderService.showMessage('Driver contact information not available', 'error');
      return;
    }

    try {
      this.chatService.addDriverToChat(
        Number(ride.driver_id),
        ride.driver_name,
        ride.ride_id
      );
      this.router.navigate(['/rider/chat']);
    } catch (error) {
      console.error('Failed to start chat:', error);
      this.riderService.showMessage('Failed to start chat with driver', 'error');
    }
  }

  cancelRide(ride: BookedRide) {
    if (!confirm(`Are you sure you want to cancel this ride with ${ride.driver_name}?`)) {
      return;
    }

    const sub = this.riderService.cancelRideRequest(ride.request_id).subscribe({
      next: () => {
        this.loadRides();
      },
      error: (error) => {
        console.error('Failed to cancel ride:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  rateRide(ride: BookedRide) {
    this.riderService.showMessage('Rating feature coming soon!', 'success');
  }

  downloadReceipt(ride: BookedRide) {
    this.riderService.showMessage('Receipt download feature coming soon!', 'success');
  }

  getStopName(stopId: string): string {
    return this.riderService.getStopName(stopId);
  }

  formatDateTime(dateString: string): string {
    return this.riderService.formatDateTime(dateString);
  }

  isRidePast(departureTime: string): boolean {
    return new Date(departureTime) < new Date();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'accepted':
        return 'accepted';
      case 'completed':
        return 'completed';
      case 'cancelled':
      case 'rejected':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}
