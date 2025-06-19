import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule], // ✅ Add HttpClientModule here for standalone
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'] // ✅ Corrected 'styleUrl' to 'styleUrls'
})
export class RegistrationComponent implements OnInit {
  isDriver = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient, // ✅ Corrected spelling: 'http', not 'htpp'
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
  }

  onSubmit(form: any) {
    if (form.invalid) return;

    const formData = form.value;
    const payload: any = {
      user_name: formData.username,
      email: formData.email,
      phone_number: formData.phone,
      gender: formData.gender,
      password: formData.password,
      role_id: this.isDriver ? 1 : 2
    };

    // Optional: Include driver fields only if needed
    if (this.isDriver) {
      payload.license_number = formData.license;
      payload.experience = formData.experience;
    }

    this.http.post("http://127.0.0.1:42099/register", payload).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration Failed';
        alert(err)
      }
    });
  }
}

















