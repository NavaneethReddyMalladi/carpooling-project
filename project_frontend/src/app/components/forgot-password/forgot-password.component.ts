import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-forgot-password',
  imports:[CommonModule,RouterLink,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.auth.requestPasswordReset(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || '✅ Reset link sent to your email!';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || '❌ Something went wrong. Try again.';
      }
    });
  }
}
