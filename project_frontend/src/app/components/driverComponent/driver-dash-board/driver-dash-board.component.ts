import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DriverService, DashboardStats } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';
import { DriverChatService } from '../../../services/driverchat.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dash-board.component.html',
  styleUrls: ['./driver-dash-board.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DriverDashboardComponent implements OnInit {
  driverDetails$: Observable<any>;
  dashboardStats$: Observable<DashboardStats>;
  recentRides$: Observable<any[]>;

  constructor(
    private driverService: DriverService,
    private rideService: RideService,
    private driverChatService:DriverChatService,
    private router: Router
  ) {
    this.driverDetails$ = this.driverService.driverDetails$;
    this.dashboardStats$ = this.rideService.dashboardStats$;
    this.recentRides$ = this.rideService.recentRides$;
  }
  ngOnInit(): void {
    this.driverService.loadDriverData().then(() => {
      this.loadDashboardData();
    }).catch((err: any) => {
      console.error('Error loading driver data:', err);
      this.router.navigate(['/login']);
    });
  }
  
  
  startChatWithRider(riderId: number, riderName: string, rideId?: number) {
    this.driverChatService.addRiderToChat(riderId, riderName, rideId);
    this.router.navigate(['/driver/chat']);
  }

  private loadDashboardData() {
    this.rideService.loadDashboardStats().subscribe({
      next: (stats) => {
        console.log('Dashboard stats loaded:', stats);
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
      }
    });

    this.rideService.loadDriverRides().subscribe({
      next: (rides) => {
        console.log('Rides loaded for dashboard:', rides.length);
      },
      error: (err) => {
        console.error('Failed to load rides for dashboard:', err);
      }
    });
  }

  trackByRideId(index: number, ride: any): any {
    return ride.id || index;
  }
}