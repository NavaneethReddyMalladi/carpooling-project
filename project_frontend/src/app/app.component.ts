import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { DdashboardComponent } from './components/ddashboard/ddashboard.component';
import { RdashboardComponent } from './components/rdashboard/rdashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LoginComponent,RegistrationComponent,CommonModule,RouterLink,HomeComponent,DdashboardComponent,RdashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'project_frontend';
}
