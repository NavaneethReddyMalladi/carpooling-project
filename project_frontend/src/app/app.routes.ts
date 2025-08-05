import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';

import { DriverComponent } from './components/driverComponent/driver/driver.component';
import { DriverDashboardComponent } from './components/driverComponent/driver-dash-board/driver-dash-board.component';
import { CreateRideComponent } from './components/driverComponent/driver-create-ride/driver-create-ride.component';
import { MyRidesComponent } from './components/driverComponent/driver-my-rides/driver-my-rides.component';
import { RideRequestsComponent } from './components/driverComponent/driver-ride-requests/driver-ride-requests.component';
import { DriverProfileComponent } from './components/driverComponent/driver-profile/driver-profile.component';

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
import { DriverChatComponent } from './components/driverComponent/driver-chat/driver-chat.component';
import { DriverWalletComponent } from './components/driverComponent/driver-wallet/driver-wallet.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: '', component: HomeComponent },

  {
    path: 'driver',
    component: DriverComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Driver' },
    children: [
      { path: '', component: DriverDashboardComponent },  
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' }, 
      { path: 'create-ride', component: CreateRideComponent },
      { path: 'myrides', component: MyRidesComponent },
      { path: 'requests', component: RideRequestsComponent },
      { path: 'profile', component: DriverProfileComponent },
      {path:'wallet',component:DriverWalletComponent
      },
      {path:'chat',component:DriverChatComponent}
    ]
  },
  
  {
    path: 'rider',
    component: RiderLayoutComponent,  
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Rider' },
    children: [
      { path: '', component: RiderDashboardComponent },  
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' },  
      { path: 'profile', component: RiderProfileComponent }, 
      { path: 'myrides', component: RiderMyRidesComponent },  
      { path: 'chat', component: RiderChatComponent }, 
      { path: 'help', component: RiderHelpComponent },  
      { path: 'wallet', component: RiderWalletComponent },  
      { path: 'activity', component: RiderActivityComponent }, 
    ]
  },

  { path: '**', redirectTo: '' }
];