import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverService, Stop } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-create-ride',
  templateUrl: './driver-create-ride.component.html',
  styleUrls: ['./driver-create-ride.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateRideComponent implements OnInit, OnDestroy {
  sourceStops: Stop[] = [];
  destStops: Stop[] = [];
  isLoading = false;

  ride = {
    origin_stop_id: '',
    destination_stop_id: '',
    departure_time: '',
    available_seats: 1,
    route_id: '',
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideService: RideService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSourceStops();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadSourceStops() {
    this.driverService.loadSourceStops().subscribe({
      next: (stops) => {
        this.sourceStops = stops;
        console.log('Source stops loaded:', stops.length);
      },
      error: (err) => {
        console.error('Failed to load source stops:', err);
      }
    });
  }

  onOriginStopChange() {
    // Reset destination selection when origin changes
    this.ride.destination_stop_id = '';
    this.destStops = [];

    if (this.ride.origin_stop_id) {
      this.driverService.loadDestinationStops(this.ride.origin_stop_id).subscribe({
        next: (stops) => {
          this.destStops = stops;
          console.log('Destination stops loaded:', stops.length);
        },
        error: (err) => {
          console.error('Failed to load destination stops:', err);
          this.destStops = [];
        }
      });
    }
  }

  createRide() {
    this.driverService.clearMessages();
    this.isLoading = true;

    this.rideService.createRide(this.ride).subscribe({
      next: (response) => {
        console.log('Ride created successfully:', response);
        this.resetForm();
        this.isLoading = false;
        
        // Navigate to active rides tab
        setTimeout(() => {
          this.router.navigate(['/driver/myrides']);
        }, 1000);
      },
      error: (error) => {
        console.error('Failed to create ride:', error);
        this.driverService.setError(error);
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
    this.destStops = [];
  }
}