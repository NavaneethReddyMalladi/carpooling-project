import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';
import { RiderDashboardComponent } from './components/riderdashboard/riderdashboard.component';
import { DriverDashboardComponent } from './components/driverdashboard/driverdashboard.component';
import { DriverProfileComponent } from './components/driverprofile/driverprofile.component';


export const routes: Routes = [

    { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  {path:'',component:HomeComponent},
  {path:'rider',component:RiderDashboardComponent},
  {path:'driver',component:DriverDashboardComponent
  },
  {path:'driver/profile',component:DriverProfileComponent}
  
];
