import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
// import { RiderDashboardComponent } from './components/riderdashboard/riderdashboard.component';


@Component({
  selector: 'app-root',
  // imports: [RouterOutlet,LoginComponent,RegistrationComponent,CommonModule,RouterLink,HomeComponent,DdashboardComponent,RdashboardComponent],
  imports:[RouterOutlet,FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'project_frontend';
}
