import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { RiderService, RiderDetails } from '../../../services/rider.service';

@Component({
  selector: 'app-rider-profile',
  templateUrl: './rider-profile.component.html',
  styleUrls: ['./rider-profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RiderProfileComponent implements OnInit, OnDestroy {
  riderDetails: RiderDetails = {
    rider_id: '',
    rider_name: '',
    email: '',
    phone_number: '',
    gender: '',
    is_verified: false,
    role_id: '',
    create_datetime: '',
    driver_id: null,
    start_stop_id: '',
    destination_stop_id: ''
  };

  isEditingProfile = false;
  originalDetails: RiderDetails | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private riderService: RiderService) {}

  ngOnInit() {
    this.loadProfileData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadProfileData() {
    // Load full rider details from backend
    this.riderService.loadRiderData().then(() => {
      // Data is automatically updated through the subscription
    }).catch((error) => {
      console.error('Failed to load profile data:', error);
    });
  }

  private setupSubscriptions() {
    // Subscribe to rider details
    this.subscriptions.push(
      this.riderService.riderDetails$.subscribe(details => {
        this.riderDetails = { ...details };
        if (!this.originalDetails) {
          this.originalDetails = { ...details };
        }
      })
    );
  }

  // Start editing profile
  editProfile() {
    this.originalDetails = { ...this.riderDetails };
    this.isEditingProfile = true;
  }

  // Save profile changes
  saveProfile() {
    if (!this.riderDetails.rider_id) {
      this.riderService.showMessage('User ID missing', 'error');
      return;
    }

    this.riderService.updateProfile(this.riderDetails).subscribe({
      next: (response) => {
        this.isEditingProfile = false;
        this.originalDetails = { ...this.riderDetails };
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
      }
    });
  }

  // Cancel editing
  cancelEdit() {
    if (this.originalDetails) {
      this.riderDetails = { ...this.originalDetails };
    }
    this.isEditingProfile = false;
  }

  // Utility method
  formatDateTime(dateString: string): string {
    return this.riderService.formatDateTime(dateString);
  }
}