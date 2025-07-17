import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RiderService, Stop } from '../../../services/rider.service';
import { RideSearchService, Ride } from '../../../services/ridesearch.service';
import { ChatService } from '../../../services/riderchat.service';

@Component({
  selector: 'app-rider-dashboard',
  templateUrl: './rider-dash-board.component.html',
  styleUrls: ['./rider-dash-board.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RiderDashboardComponent implements OnInit, OnDestroy {
  sourceStops: Stop[] = [];
  destStops: Stop[] = [];
  rides: Ride[] = [];
  selectedRide: Ride | null = null;
  riderDetails: any = {};

  selectedSource = '';
  selectedDest = '';
  isLoading = false;
  isBooking = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private riderService: RiderService,
    private rideSearchService: RideSearchService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialData() {
    // Load source stops
    this.riderService.loadSourceStops().subscribe({
      next: (stops) => {
        this.sourceStops = stops;
      },
      error: (err) => {
        console.error('Failed to load source stops:', err);
      }
    });
  }

  private setupSubscriptions() {
    // Subscribe to rider details
    this.subscriptions.push(
      this.riderService.riderDetails$.subscribe(details => {
        this.riderDetails = details;
      })
    );

    // Subscribe to rides
    this.subscriptions.push(
      this.rideSearchService.rides$.subscribe(rides => {
        this.rides = rides;
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      this.rideSearchService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    // Subscribe to selected ride
    this.subscriptions.push(
      this.rideSearchService.selectedRide$.subscribe(ride => {
        this.selectedRide = ride;
      })
    );

    // Subscribe to booking state
    this.subscriptions.push(
      this.rideSearchService.isBooking$.subscribe(booking => {
        this.isBooking = booking;
      })
    );
  }

  // Handle source change
  onSourceChange() {
    this.selectedDest = '';
    this.destStops = [];
    this.rides = [];

    if (this.selectedSource) {
      this.rideSearchService.loadDestinationStops(this.selectedSource).subscribe({
        next: (stops) => {
          this.destStops = stops;
        },
        error: (err) => {
          console.error('Failed to load destination stops:', err);
        }
      });
    }
  }

  // Search for rides
  searchRides() {
    if (this.selectedSource && this.selectedDest) {
      this.rideSearchService.searchRides(this.selectedSource, this.selectedDest).subscribe({
        next: (rides) => {
          // Results are automatically updated through the subscription
        },
        error: (err) => {
          console.error('Failed to search rides:', err);
        }
      });
    }
  }

  // Book a ride
  bookRide(ride: Ride) {
    this.rideSearchService.selectRide(ride);
  }

  // Close booking modal
  closeBookingModal() {
    this.rideSearchService.clearSelectedRide();
  }

  // Confirm booking
  confirmBooking() {
    if (!this.selectedRide) return;

    this.rideSearchService.bookRide(this.selectedRide).subscribe({
      next: (response) => {
        // Refresh search results
        this.searchRides();
        
        // Add driver to chat sessions after successful booking
        if (this.selectedRide && this.selectedRide.driver_id) {
          this.chatService.addDriverToChat(
            parseInt(this.selectedRide.driver_id), 
            this.selectedRide.driver_name,
            this.selectedRide.ride_id ? parseInt(this.selectedRide.ride_id) : undefined
          );
        }
      },
      error: (err) => {
        console.error('Failed to book ride:', err);
      }
    });
  }

  // Utility methods
  getStopName(stopId: string): string {
    return this.riderService.getStopName(stopId);
  }

  formatDateTime(dateString: string): string {
    return this.riderService.formatDateTime(dateString);
  }
}