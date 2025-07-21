import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DriverService, DashboardStats } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DriverProfileComponent implements OnInit {
  driverDetails$: Observable<any>;
  dashboardStats$: Observable<DashboardStats>;
  isOnline$: Observable<boolean>;

  constructor(
    private driverService: DriverService,
    private rideService: RideService
  ) {
    this.driverDetails$ = this.driverService.driverDetails$;
    this.dashboardStats$ = this.rideService.dashboardStats$;
    this.isOnline$ = this.driverService.isOnline$;
  }

  ngOnInit() {
    this.loadProfileData();
  }

  private loadProfileData() {
    this.rideService.loadDashboardStats().subscribe({
      next: (stats) => {
        console.log('Profile stats loaded:', stats);
      },
      error: (err) => {
        console.error('Failed to load profile stats:', err);
      }
    });
  }

  calculateSuccessRate(completed: number, total: number): string {
    return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
  }
}