import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DriverService, DashboardStats } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DriverProfileComponent implements OnInit, OnDestroy {
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
  isOnline = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private rideService: RideService
  ) {}

  ngOnInit() {
    this.setupSubscriptions();
    this.loadProfileData();
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

    // Subscribe to online status
    this.subscriptions.push(
      this.driverService.isOnline$.subscribe(isOnline => {
        this.isOnline = isOnline;
      })
    );

    // Subscribe to dashboard stats for profile metrics
    this.subscriptions.push(
      this.rideService.dashboardStats$.subscribe(stats => {
        this.dashboardStats = stats;
      })
    );
  }

  private loadProfileData() {
    // Load dashboard statistics for profile display
    this.rideService.loadDashboardStats().subscribe({
      next: (stats) => {
        console.log('Profile stats loaded:', stats);
      },
      error: (err) => {
        console.error('Failed to load profile stats:', err);
      }
    });
  }
}