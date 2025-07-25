import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DriverService, Ride } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-my-rides',
  templateUrl: './driver-my-rides.component.html',
  styleUrls: ['./driver-my-rides.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MyRidesComponent implements OnInit {
  activeRides$: Observable<Ride[]>;
  completedRides$: Observable<Ride[]>;
  cancelledRides$: Observable<Ride[]>;
  ridesSubTab = 'active';

  constructor(
    private driverService: DriverService,
    private rideService: RideService
  ) {
    this.activeRides$ = this.rideService.activeRides$;
    this.completedRides$ = this.rideService.completedRides$;
    this.cancelledRides$ = this.rideService.cancelledRides$;
  }

  ngOnInit() {
    this.loadRides();
  }

  private loadRides() {
    this.rideService.loadDriverRides().subscribe({
      next: (rides) => {
        console.log('Rides loaded for my rides:', rides.length);
      },
      error: (err) => {
        console.error('Failed to load rides:', err);
      }
    });
  }

  setRidesSubTab(subTab: string) {
    this.ridesSubTab = subTab;
  }

  completeRide(rideId: number) {
    if (!confirm('Mark this ride as completed?')) return;

    this.rideService.completeRide(rideId).subscribe({
      next: () => {
        console.log('Ride completed successfully');
        this.loadRides(); // refresh rides
      },
      error: (err) => {
        console.error('Failed to complete ride:', err);
      }
    });
  }

  cancelRide(rideId: number) {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    this.rideService.cancelRide(rideId).subscribe({
      next: () => {
        console.log('Ride cancelled successfully');
        this.loadRides(); // refresh rides
      },
      error: (err) => {
        console.error('Failed to cancel ride:', err);
      }
    });
  }

  formatTime(timeString: string): string {
    return this.driverService.formatTime(timeString);
  }

  trackByRideId(index: number, ride: Ride): any {
    return ride.ride_id || index;
  }
}
