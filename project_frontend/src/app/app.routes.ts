import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';

// Import the modular driver components
import { DriverComponent } from './components/driverComponent/driver/driver.component';
import { DriverDashboardComponent } from './components/driverComponent/driver-dash-board/driver-dash-board.component';
import { CreateRideComponent } from './components/driverComponent/driver-create-ride/driver-create-ride.component';
import { MyRidesComponent } from './components/driverComponent/driver-my-rides/driver-my-rides.component';
import { RideRequestsComponent } from './components/driverComponent/driver-ride-requests/driver-ride-requests.component';
import { DriverProfileComponent } from './components/driverComponent/driver-profile/driver-profile.component';

// Import the new modular rider components
import { RiderLayoutComponent } from './components/riderComponent/rider-layout/rider-layout.component'
import { RiderDashboardComponent } from './components/riderComponent/rider-dash-board/rider-dash-board.component';
import { RiderProfileComponent } from './components/riderComponent/rider-profile/rider-profile.component';
import { RiderMyRidesComponent } from './components/riderComponent/rider-my-rides/rider-my-rides.component';
import { RiderChatComponent } from './components/riderComponent/rider-chat/rider-chat.component';
import { RiderHelpComponent } from './components/riderComponent/rider-help/rider-help.component';
import { RiderWalletComponent } from './components/riderComponent/rider-wallet/rider-wallet.component';
import { RiderActivityComponent } from './components/riderComponent/rider-activity/rider-activity.component';

import { AuthGuard } from '../app/components/gaurds/auth.guard';
import { RoleGuard } from '../app/components/gaurds/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: '', component: HomeComponent },

  // Modular driver routes with layout and child components
  {
    path: 'driver',
    component: DriverComponent,  // Main layout with navbar and sidebar
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Driver' },
    children: [
      { path: '', component: DriverDashboardComponent },  // Default route /driver
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' },  // Redirect /driver/dashboard to /driver
      { path: 'create-ride', component: CreateRideComponent },
      { path: 'myrides', component: MyRidesComponent },
      { path: 'requests', component: RideRequestsComponent },
      { path: 'profile', component: DriverProfileComponent }
    ]
  },
  
  // Modular rider routes with layout and child components
  {
    path: 'rider',
    component: RiderLayoutComponent,  // Main layout with navbar and sidebar
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Rider' },
    children: [
      { path: '', component: RiderDashboardComponent },  // Default route /rider (Dashboard - search/book)
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' },  // Redirect /rider/dashboard to /rider
      { path: 'profile', component: RiderProfileComponent },  // Account management
      { path: 'myrides', component: RiderMyRidesComponent },  // Booked rides management
      { path: 'chat', component: RiderChatComponent },  // Driver communication
      { path: 'help', component: RiderHelpComponent },  // Support and FAQ
      { path: 'wallet', component: RiderWalletComponent },  // Payment management
      { path: 'activity', component: RiderActivityComponent },  // Usage statistics
    ]
  },

  { path: '**', redirectTo: '' }
];