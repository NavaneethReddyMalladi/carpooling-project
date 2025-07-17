import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DriverService, DashboardStats } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dash-board.component.html',
  styleUrls: ['./driver-dash-board.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  driverDetails: any = {};
  dashboardStats: DashboardStats = {
    todayEarnings: 0,
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    activeRides: 0,
    rating: 0,
    onlineHours: 0
  };
  recentRides: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideService: RideService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to driver details
    this.subscriptions.push(
      this.driverService.driverDetails$.subscribe(details => {
        this.driverDetails = details;
      })
    );

    // Subscribe to dashboard stats
    this.subscriptions.push(
      this.rideService.dashboardStats$.subscribe(stats => {
        this.dashboardStats = stats;
      })
    );

    // Subscribe to recent rides
    this.subscriptions.push(
      this.rideService.recentRides$.subscribe(rides => {
        this.recentRides = rides;
      })
    );
  }

  private loadDashboardData() {
    // Load dashboard statistics
    this.rideService.loadDashboardStats().subscribe({
      next: (stats) => {
        console.log('Dashboard stats loaded:', stats);
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
      }
    });

    // Load rides to get recent rides
    this.rideService.loadDriverRides().subscribe({
      next: (rides) => {
        console.log('Rides loaded for dashboard:', rides.length);
      },
      error: (err) => {
        console.error('Failed to load rides for dashboard:', err);
      }
    });
  }
}