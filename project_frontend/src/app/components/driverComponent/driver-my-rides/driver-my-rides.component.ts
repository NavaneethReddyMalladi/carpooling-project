import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverService, Ride } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-my-rides',
  templateUrl: './driver-my-rides.component.html',
  styleUrls: ['./driver-my-rides.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MyRidesComponent implements OnInit, OnDestroy {
  activeRides: Ride[] = [];
  completedRides: Ride[] = [];
  cancelledRides: Ride[] = [];
  ridesSubTab = 'active';

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideService: RideService
  ) {}

  ngOnInit() {
    this.loadRides();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to active rides
    this.subscriptions.push(
      this.rideService.activeRides$.subscribe(rides => {
        this.activeRides = rides;
      })
    );

    // Subscribe to completed rides
    this.subscriptions.push(
      this.rideService.completedRides$.subscribe(rides => {
        this.completedRides = rides;
      })
    );

    // Subscribe to cancelled rides
    this.subscriptions.push(
      this.rideService.cancelledRides$.subscribe(rides => {
        this.cancelledRides = rides;
      })
    );
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
      },
      error: (err) => {
        console.error('Failed to cancel ride:', err);
      }
    });
  }

  formatTime(timeString: string): string {
    return this.driverService.formatTime(timeString);
  }
}