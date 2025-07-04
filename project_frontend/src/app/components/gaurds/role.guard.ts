import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole']; // 'Driver' | 'Rider'
    const user = this.auth.getCurrentUser();

    if (user && user.role === expectedRole) {
      return true;
    }

    this.router.navigate(['/unauthorized']); // Optionally create this page
    return false;
  }
}
