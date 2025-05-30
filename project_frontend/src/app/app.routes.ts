import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';
import { DdashboardComponent } from './components/ddashboard/ddashboard.component';
import { RdashboardComponent } from './components/rdashboard/rdashboard.component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  {path:'',component:HomeComponent},
  {path:'driver',component:DdashboardComponent},
  {path:'rider',component:RdashboardComponent}
];
