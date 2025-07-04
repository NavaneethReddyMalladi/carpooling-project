import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        if (this.auth.role === 'Driver') {
          this.router.navigate(['/driver']);
        } else if (this.auth.role === 'Rider') {
          this.router.navigate(['/rider']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => alert(err.error?.message || 'Login failed')
    });
  }
}
