import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = ''; 
    this.isLoading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.auth.role === 'Driver') {
          this.router.navigate(['/driver']);
        } else if (this.auth.role === 'Rider') {
          this.router.navigate(['/rider']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  onForgotPassword() {
    // Navigate to forgot password page or implement forgot password logic
    this.router.navigate(['/forgot-password']);
    // Alternative: You can implement a modal or inline forgot password functionality
  }
}