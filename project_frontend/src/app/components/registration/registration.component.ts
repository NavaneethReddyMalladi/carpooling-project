import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  isDriver = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const role = params['role'];
      this.isDriver = role === 'driver';
    });
  }

  toggleRole(role: string) {
    this.isDriver = role === 'driver';
    this.errorMessage = ''; // Clear error when switching roles
  }

  onSubmit(form: any) {
    if (form.invalid) return;

    this.errorMessage = ''; // Clear previous error
    this.isLoading = true;

    const formData = form.value;
    const payload: any = {
      user_name: formData.username,
      email: formData.email,
      phone_number: formData.phone,
      gender: formData.gender,
      password: formData.password,
      role_id: this.isDriver ? 1 : 2
    };

    // Include driver fields only if user is registering as driver
    if (this.isDriver) {
      payload.license_number = formData.license;
      payload.vehicle_type = formData.vehicle;
      payload.experience = formData.experience;
      payload.vehicle_rc = formData.vechileRc;
    }

    this.http.post("http://127.0.0.1:42099/register", payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}