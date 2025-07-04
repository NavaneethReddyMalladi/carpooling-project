import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';
import { RiderDashboardComponent } from './components/riderdashboard/riderdashboard.component';
import { DriverDashboardComponent } from './components/driverdashboard/driverdashboard.component';
import { DriverProfileComponent } from './components/driverprofile/driverprofile.component';



import { AuthGuard } from '../app/components/gaurds/auth.guard';
import { RoleGuard } from '../app/components/gaurds/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: '', component: HomeComponent },

  {
    path: 'driver',
    component: DriverDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Driver' }
  },
  {
    path: 'driver/profile',
    component: DriverProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Driver' }
  },
  {
    path: 'rider',
    component: RiderDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Rider' }
  }
];
