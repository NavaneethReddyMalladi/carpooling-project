import { Component } from '@angular/core';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports:[CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  newPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  token: string | null = null;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token'); // read ?token= from URL
  }

  onSubmit() {
    if (!this.token) {
      this.errorMessage = 'Invalid or missing token';
      return;
    }

    this.isLoading = true;
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Password reset successful! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Something went wrong';
      }
    });
  }
}
