import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DriverService, DashboardStats } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DriverProfileComponent implements OnInit {
  driverDetails$: Observable<any>;
  dashboardStats$: Observable<DashboardStats>;
  isOnline$: Observable<boolean>;
  
  isEditMode = false;
  isLoading = false;
  profileForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(
    private driverService: DriverService,
    private rideService: RideService,
    private fb: FormBuilder
  ) {
    this.driverDetails$ = this.driverService.driverDetails$;
    this.dashboardStats$ = this.rideService.dashboardStats$;
    this.isOnline$ = this.driverService.isOnline$;
    
    this.profileForm = this.fb.group({
      driver_name: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadProfileData();
    this.subscribeToDriverDetails();
  }

  private loadProfileData() {
    this.rideService.loadDashboardStats().subscribe({
      next: (stats) => {
        console.log('Profile stats loaded:', stats);
      },
      error: (err) => {
        console.error('Failed to load profile stats:', err);
        this.showError('Failed to load profile statistics');
      }
    });
  }

  private subscribeToDriverDetails() {
    this.driverDetails$.subscribe(details => {
      if (details && details.driver_id) {
        this.profileForm.patchValue({
          driver_name: details.driver_name || '',
          gender: details.gender || '',
          phone: details.phone || '',
          email: details.email || ''
        });
      }
    });
  }

  calculateSuccessRate(completed: number, total: number): string {
    return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.clearMessages();
    
    if (!this.isEditMode) {
      // Reset form when canceling
      this.subscribeToDriverDetails();
    }
  }

  onSubmit() {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.clearMessages();

      const updatedData = {
        user_name: this.profileForm.value.driver_name,
        gender: this.profileForm.value.gender,
        phone_number: this.profileForm.value.phone,
        email: this.profileForm.value.email
      };

      this.driverService.updateDriverProfile(updatedData).subscribe({
        next: (response) => {
          this.showMessage('Profile updated successfully!');
          this.isEditMode = false;
          this.isLoading = false;
          
          // Reload driver data to get updated information
          this.driverService.loadDriverData().catch(err => {
            console.error('Failed to reload driver data:', err);
          });
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.showError('Failed to update profile. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showError('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(field => {
      const control = this.profileForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return fieldName === 'phone' ? 'Please enter a valid 10-digit phone number' : 'Invalid format';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      driver_name: 'Name',
      gender: 'Gender',
      phone: 'Phone',
      email: 'Email'
    };
    return displayNames[fieldName] || fieldName;
  }

  private showMessage(message: string) {
    this.message = message;
    this.error = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  private showError(error: string) {
    this.error = error;
    this.message = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  private clearMessages() {
    this.message = '';
    this.error = '';
  }
}