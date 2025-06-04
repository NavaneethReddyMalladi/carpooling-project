import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driverprofile.component.html',
  styleUrls: ['./driverprofile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DriverProfileComponent implements OnInit {
  @Input() token: string | null = null;
  @Input() userId: string | null = null;

  driverDetails: any = {
    driver_id: '',
    driver_name: '',
    experience: null,
    license_number: '',
    gender: ''
  };

  isEditingProfile = false;
  message = '';
  error = '';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    if (this.token && this.userId && isPlatformBrowser(this.platformId)) {
      this.loadDriverDetails(this.userId);
    }
  }

  loadDriverDetails(userId: string) {
    this.http.get<any>(`http://127.0.0.1:42099/users/${userId}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (user) => {
        this.driverDetails.driver_id = user.driver_id;
        this.driverDetails.driver_name = user.user_name;
        this.driverDetails.experience = user.experience || null;
        this.driverDetails.license_number = user.license_number || '';
        this.driverDetails.gender = user.gender;
      },
      error: (err) => {
        this.error = 'Failed to load driver details';
        console.error(err);
      }
    });
  }

  onEditProfile() {
    this.isEditingProfile = true;
    this.message = '';
    this.error = '';
  }

  onCancelEdit() {
    this.isEditingProfile = false;
    if (this.userId) this.loadDriverDetails(this.userId);
  }

  onSaveProfile() {
    if (!this.driverDetails.driver_id) {
      this.error = 'Driver ID missing';
      return;
    }

    const updateData = {
      driver_name: this.driverDetails.driver_name,
      experience: this.driverDetails.experience,
      license_number: this.driverDetails.license_number,
      gender: this.driverDetails.gender
    };

    this.http.put(`http://127.0.0.1:42099/drivers/${this.driverDetails.driver_id}`, updateData, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.message = 'Profile updated successfully!';
        this.error = '';
        this.isEditingProfile = false;
      },
      error: (err) => {
        this.error = 'Failed to update profile';
        console.error(err);
      }
    });
  }
}
