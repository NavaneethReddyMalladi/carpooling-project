import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string = '';
  emailError: string = '';
  passwordError: string = '';
  isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.checkExistingLogin();
      this.loadRememberedCredentials();
    }
  }

  checkExistingLogin() {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('role_id');

    if (token && roleId) {
      if (roleId === '1') {
        this.router.navigate(['/driver']);
      } else if (roleId === '2') {
        this.router.navigate(['/rider']);
      }
    }
  }

  loadRememberedCredentials() {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'Email is required';
      return false;
    }
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  onEmailBlur() {
    this.validateEmail();
  }

  onPasswordBlur() {
    this.validatePassword();
  }

  onSubmit() {
    this.errorMessage = '';
    this.emailError = '';
    this.passwordError = '';

    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.email.toLowerCase().trim(),
      password: this.password
    };

    this.http.post<any>('http://127.0.0.1:42099/login', loginData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role_id', response.role_id.toString());
          localStorage.setItem('user_id', response.user_id.toString());

          if (this.rememberMe) {
            localStorage.setItem('remembered_email', this.email);
          } else {
            localStorage.removeItem('remembered_email');
          }

          if (response.user_name) {
            localStorage.setItem('user_name', response.user_name);
          }
        }

        if (response.role_id === 1) {
          this.router.navigate(['/driver']);
        } else if (response.role_id === 2) {
          this.router.navigate(['/rider']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);

        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 429) {
          this.errorMessage = 'Too many login attempts. Please try again later.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  loginWithGoogle() {
    console.log('Google login - to be implemented');
  }

  loginWithFacebook() {
    console.log('Facebook login - to be implemented');
  }

  quickLogin(userType: 'driver' | 'rider') {
    if (userType === 'driver') {
      this.email = 'driver@example.com';
      this.password = 'password123';
    } else {
      this.email = 'rider@example.com';
      this.password = 'password123';
    }
  }
}
