import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RiderService } from '../../../services/rider.service';
import { ChatService } from '../../../services/riderchat.service';

interface BookedRide {
  id: string;
  booking_id?: string;
  driver_name: string;
  origin_stop_id: string;
  destination_stop_id: string;
  departure_time: string;
  seats_booked?: number;
  price?: number;
  status: string;
  cancellation_reason?: string;
}

@Component({
  selector: 'app-rider-myrides',
  templateUrl: './rider-my-rides.component.html',
  styleUrls: ['./rider-my-rides.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RiderMyRidesComponent implements OnInit {
  activeTab = 'upcoming';
  
  upcomingRides: BookedRide[] = [];
  completedRides: BookedRide[] = [];
  cancelledRides: BookedRide[] = [];

  constructor(
    private riderService: RiderService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.loadRides();
  }

  private loadRides() {
    // This would typically load from your backend API
    // For now, using mock data structure
    this.loadMockRides();
  }

  private loadMockRides() {
    // In a real application, you would make HTTP calls to get user's booked rides
    // Example structure:
    this.upcomingRides = [
      // Mock data - replace with actual API call
    ];
    
    this.completedRides = [
      // Mock data - replace with actual API call
    ];
    
    this.cancelledRides = [
      // Mock data - replace with actual API call
    ];
  }

  // Set active tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Contact driver
  contactDriver(ride: BookedRide) {
    // Add driver to chat and navigate to chat
    // You would need driver_id from the ride data
    console.log('Contacting driver for ride:', ride);
    
    // For now, just log - in real implementation:
    // this.chatService.addDriverToChat(driverId, ride.driver_name, parseInt(ride.id));
    // this.router.navigate(['/rider/chat']);
  }

  // Cancel ride
  cancelRide(ride: BookedRide) {
    if (!confirm(`Are you sure you want to cancel this ride with ${ride.driver_name}?`)) {
      return;
    }

    // Implementation would make API call to cancel ride
    console.log('Cancelling ride:', ride);
    
    // Show loading state, make API call, update UI
    this.riderService.showMessage('Ride cancellation request submitted', 'success');
    
    // Remove from upcoming and add to cancelled (locally until API call completes)
    this.upcomingRides = this.upcomingRides.filter(r => r.id !== ride.id);
    this.cancelledRides.unshift({
      ...ride,
      status: 'cancelled',
      cancellation_reason: 'Cancelled by rider'
    });
  }

  // Rate ride
  rateRide(ride: BookedRide) {
    console.log('Rating ride:', ride);
    // Implementation would show rating modal/component
    this.riderService.showMessage('Rating feature coming soon!', 'success');
  }

  // Download receipt
  downloadReceipt(ride: BookedRide) {
    console.log('Downloading receipt for ride:', ride);
    // Implementation would generate/download receipt
    this.riderService.showMessage('Receipt download feature coming soon!', 'success');
  }

  // Utility methods
  getStopName(stopId: string): string {
    return this.riderService.getStopName(stopId);
  }

  formatDateTime(dateString: string): string {
    return this.riderService.formatDateTime(dateString);
  }
}