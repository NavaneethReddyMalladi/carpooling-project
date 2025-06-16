// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { RouterLink, Router, ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-registration',
//   standalone: true,
//   imports: [CommonModule, RouterLink, FormsModule, HttpClientModule], // ✅ Add HttpClientModule here for standalone
//   templateUrl: './registration.component.html',
//   styleUrls: ['./registration.component.css'] // ✅ Corrected 'styleUrl' to 'styleUrls'
// })
// export class RegistrationComponent implements OnInit {
//   isDriver = false;
//   errorMessage = '';

//   constructor(
//     private route: ActivatedRoute,
//     private http: HttpClient, // ✅ Corrected spelling: 'http', not 'htpp'
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.route.queryParams.subscribe(params => {
//       const role = params['role'];
//       this.isDriver = role === 'driver';
//     });
//   }

//   toggleRole(role: string) {
//     this.isDriver = role === 'driver';
//   }

//   onSubmit(form: any) {
//     if (form.invalid) return;

//     const formData = form.value;
//     const payload: any = {
//       user_name: formData.username,
//       email: formData.email,
//       phone_number: formData.phone,
//       gender: formData.gender,
//       password: formData.password,
//       role_id: this.isDriver ? 1 : 2
//     };

//     // Optional: Include driver fields only if needed
//     if (this.isDriver) {
//       payload.license_number = formData.license;
//       payload.experience = formData.experience;
//     }

//     this.http.post("http://127.0.0.1:42099/register", payload).subscribe({
//       next: () => {
//         this.router.navigate(['/login']);
//       },
//       error: (err) => {
//         this.errorMessage = err.error?.message || 'Registration Failed';
//         alert(err)
//       }
//     });
//   }
// }



















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
  successMessage = '';
  isLoading = false;
  showPassword = false;
  passwordStrength = '';
  
  // Form validation states
  formErrors: any = {};
  touchedFields: any = {};
  
  // Car-specific options
  carBrands = ['Toyota', 'Honda', 'Hyundai', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Ford', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Other'];
  carTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Crossover'];

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
    this.clearMessages();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Contains numbers
    if (/\d/.test(password)) strength++;
    
    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        this.passwordStrength = 'weak';
        break;
      case 2:
      case 3:
        this.passwordStrength = 'medium';
        break;
      case 4:
      case 5:
        this.passwordStrength = 'strong';
        break;
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  validateForm(form: any): boolean {
    this.formErrors = {};
    const formData = form.value;
    let isValid = true;

    // Required field validations
    if (!formData.username?.trim()) {
      this.formErrors.username = 'Full name is required';
      isValid = false;
    } else if (formData.username.trim().length < 2) {
      this.formErrors.username = 'Full name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email?.trim()) {
      this.formErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.validateEmail(formData.email)) {
      this.formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.phone?.trim()) {
      this.formErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!this.validatePhone(formData.phone)) {
      this.formErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.gender) {
      this.formErrors.gender = 'Please select a gender';
      isValid = false;
    }

    if (!formData.password) {
      this.formErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      this.formErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    // Driver-specific validations for car pooling
    if (this.isDriver) {
      if (!formData.license?.trim()) {
        this.formErrors.license = 'Driver license number is required';
        isValid = false;
      }

      if (!formData.experience?.trim()) {
        this.formErrors.experience = 'Driving experience is required';
        isValid = false;
      } else if (isNaN(formData.experience) || formData.experience < 1) {
        this.formErrors.experience = 'Minimum 1 year experience required for car pooling';
        isValid = false;
      }

      if (!formData.carBrand) {
        this.formErrors.carBrand = 'Car brand is required';
        isValid = false;
      }

      if (!formData.carModel?.trim()) {
        this.formErrors.carModel = 'Car model is required';
        isValid = false;
      }

      if (!formData.carType) {
        this.formErrors.carType = 'Car type is required';
        isValid = false;
      }

      if (!formData.seatingCapacity) {
        this.formErrors.seatingCapacity = 'Seating capacity is required';
        isValid = false;
      } else if (formData.seatingCapacity < 2 || formData.seatingCapacity > 8) {
        this.formErrors.seatingCapacity = 'Seating capacity must be between 2-8 passengers';
        isValid = false;
      }

      if (!formData.carYear) {
        this.formErrors.carYear = 'Car manufacturing year is required';
        isValid = false;
      } else {
        const currentYear = new Date().getFullYear();
        if (formData.carYear < 2010 || formData.carYear > currentYear) {
          this.formErrors.carYear = `Car must be manufactured between 2010-${currentYear}`;
          isValid = false;
        }
      }
    }

    return isValid;
  }

  markFieldAsTouched(fieldName: string) {
    this.touchedFields[fieldName] = true;
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(form: any) {
    // Mark all fields as touched for validation display
    Object.keys(form.controls).forEach(key => {
      this.markFieldAsTouched(key);
    });

    if (!this.validateForm(form)) {
      this.errorMessage = 'Please fix the errors above and try again.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const formData = form.value;
    const payload: any = {
      user_name: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone.trim(),
      gender: formData.gender,
      password: formData.password,
      role_id: this.isDriver ? 1 : 2
    };

    // Include driver and car details for car pooling
    if (this.isDriver) {
      payload.license_number = formData.license.trim();
      payload.experience = parseInt(formData.experience);
      payload.car_brand = formData.carBrand;
      payload.car_model = formData.carModel.trim();
      payload.car_type = formData.carType;
      payload.seating_capacity = parseInt(formData.seatingCapacity);
      payload.car_year = parseInt(formData.carYear);
      payload.car_registration = formData.carRegistration?.trim() || null;
    }

    this.http.post("http://127.0.0.1:42099/register", payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration error:', err);
        
        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid data provided. Please check your inputs.';
        } else if (err.status === 409) {
          this.errorMessage = 'User already exists with this email or phone number.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again later.';
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }
}