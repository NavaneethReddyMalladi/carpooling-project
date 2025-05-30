// src/app/services/auth.service.ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AuthService {
  http = inject(HttpClient);
  apiUrl = 'http://localhost:5000'; // Your Flask backend URL

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}
