import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RiderService } from '../../../services/rider.service';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'ride' | 'payment' | 'profile' | 'other';
  timestamp: string;
  details?: string[];
}

interface MonthlyStats {
  ridesCount: number;
  ridesChange: number;
  amountSpent: number;
  spentChange: number;
  favoriteRoute: string;
  favoriteRouteCount: number;
  carbonSaved: number;
}

@Component({
  selector: 'app-rider-activity',
  templateUrl: './rider-activity.component.html',
  styleUrls: ['./rider-activity.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RiderActivityComponent implements OnInit {
  totalRides = 0;
  totalSpent = 0;
  averageRating = 0;
  totalTravelTime = '0h 0m';
  
  selectedTimeFilter = 'week';
  allActivities: Activity[] = [];
  filteredActivities: Activity[] = [];
  
  monthlyStats: MonthlyStats = {
    ridesCount: 0,
    ridesChange: 0,
    amountSpent: 0,
    spentChange: 0,
    favoriteRoute: 'No rides yet',
    favoriteRouteCount: 0,
    carbonSaved: 0
  };

  constructor(private riderService: RiderService) {}

  ngOnInit() {
    this.loadActivityData();
  }

  private loadActivityData() {
    this.loadMockData();
    this.filterActivitiesByTime();
  }

  private loadMockData() {

    this.totalRides = 24;
    this.totalSpent = 1250.75;
    this.averageRating = 4.8;
    this.totalTravelTime = '12h 30m';

    this.monthlyStats = {
      ridesCount: 8,
      ridesChange: 15,
      amountSpent: 420.50,
      spentChange: -5,
      favoriteRoute: 'Home → Office',
      favoriteRouteCount: 5,
      carbonSaved: 12.5
    };

    this.allActivities = [
      {
        id: '1',
        title: 'Ride Completed',
        description: 'Completed ride with John Doe from Home to Office',
        type: 'ride',
        timestamp: new Date().toISOString(),
        details: ['₹45.50', '4.9★ rating']
      },
      {
        id: '2',
        title: 'Payment Made',
        description: 'Paid ₹100 for wallet top-up',
        type: 'payment',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: ['Via Visa •••• 1234']
      },
      {
        id: '3',
        title: 'Profile Updated',
        description: 'Updated phone number and emergency contact',
        type: 'profile',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    this.filteredActivities = this.allActivities;
  }

  setTimeFilter(filter: string) {
    this.selectedTimeFilter = filter;
    this.filterActivitiesByTime();
  }


  private filterActivitiesByTime() {
    const now = new Date();
    let filterDate: Date;

    switch (this.selectedTimeFilter) {
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        this.filteredActivities = this.allActivities;
        return;
    }

    this.filteredActivities = this.allActivities.filter(activity => 
      new Date(activity.timestamp) >= filterDate
    );
  }

 
  getActivityIcon(type: string): string {
    switch (type) {
      case 'ride':
        return 'fa-solid fa-car';
      case 'payment':
        return 'fa-solid fa-credit-card';
      case 'profile':
        return 'fa-solid fa-user';
      default:
        return 'fa-solid fa-circle-info';
    }
  }


  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
}