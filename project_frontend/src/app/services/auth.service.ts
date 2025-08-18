import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  token: string;
  role_name: 'Driver' | 'Rider';
  user_id: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://127.0.0.1:42099';
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ---------------- LOGIN ----------------
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (!this.isBrowser) return;

          localStorage.setItem('token', res.token);
          localStorage.setItem('role_name', res.role_name);
          localStorage.setItem('user_id', res.user_id.toString());

          const user = {
            id: res.user_id,
            email: email,
            role: res.role_name,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
        })
      );
  }

  // ---------------- LOGOUT ----------------
  logout(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  // ---------------- AUTH CHECK ----------------
  isAuthenticated(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }

  get role(): 'Driver' | 'Rider' | null {
    const user = this.getCurrentUser();
    return user?.role ?? null;
  }

  getCurrentUser(): { id: number; email: string; role: 'Driver' | 'Rider' } | null {
    if (!this.isBrowser) return null;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // ---------------- PASSWORD RESET ----------------
  
  // 1. Request password reset (send email with reset link)
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  // 2. Reset password (via token in reset link)
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { 
      token: token, 
      password: newPassword  // must match Flask key
    });
  }
}  