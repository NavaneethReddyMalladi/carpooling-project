import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink,Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://127.0.0.1:42099/login', loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role_id', response.role_id)
        localStorage.setItem('user_id',response.user_id)

        if(response.role_id===1){
          this.router.navigate(['/driver'])
        }else if(response.role_id===2){
          this.router.navigate(['/rider'])
        }
      },
      error: (err) => {
        alert(err.error.message || 'Login failed');
      }
    });
  }

}