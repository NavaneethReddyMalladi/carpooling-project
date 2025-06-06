import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { decode } from 'punycode';
import { ParsedEvent } from '@angular/compiler';
import { DriverProfileComponent } from '../driverprofile/driverprofile.component';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DriverDashboardComponent implements OnInit {
  stops: any[] = [];
  driverDetails: any = {
    driver_id: '',
    driver_name: ''
  };

  ride = {
    origin_stop_id: '',
    destination_stop_id: '',
    departure_time: '',
    available_seats: 1,
    route_id: '',
  };

  message = '';
  error = '';
  showProfileMenu = false;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    this.loadStops();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const riderId = decoded.sub?.user_id || decoded.user_id;  // adapt this key based on your token structure
        // console.log(decoded)
        // console.log(riderId)
        if (riderId) {
          this.loadRiderDetails(riderId, token);

        } else {
          console.error('User ID not found in token');
        }
      } else {
        console.error('No token found in localStorage');
      }
    }
  }

  loadRiderDetails(riderId: string, token: string) {
    this.http.get<any>(`http://127.0.0.1:42099/users/${riderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (rider) => {
        this.driverDetails.driver_id = rider.driver_id;
        // console.log(this.driverDetails.driver_id)
        // console.log(this.driverDetails.user_id)
        this.driverDetails.driver_name = rider.user_name;
        this.driverDetails.gender = rider.gender;
        // console.log(rider)
      },
      error: (err) => {
        console.error('Failed to load rider info:', err);
      }
    });
  }

  loadStops() {
    this.http.get<any[]>('http://127.0.0.1:42099/stops').subscribe({
      next: stops => this.stops = Array.isArray(stops) ? stops : [],
      error: err => console.error('Failed to fetch stops:', err)
    });
  }

  createRide() {
    this.error = '';
    this.message = '';

    if (!this.ride.origin_stop_id || !this.ride.destination_stop_id || !this.ride.departure_time || !this.ride.available_seats) {
      this.error = 'Please fill all required fields.';
      return;
    }

    const departureDate = new Date(this.ride.departure_time);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const formattedDepartureTime = 
      `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())} ` +
      `${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:00`;

    const postData = {
      driver_id: this.driverDetails.driver_id,
      origin_stop_id: Number(this.ride.origin_stop_id),
      destination_stop_id: Number(this.ride.destination_stop_id),
      departure_time: formattedDepartureTime,
      available_seats: Number(this.ride.available_seats),
      route_id: this.ride.route_id ? Number(this.ride.route_id) : null,
      status: 'Active'
    };
    const token=localStorage.getItem('token')
    this.http.post('http://127.0.0.1:42099/rides', postData,{ 
     headers: {
      Authorization: `Bearer ${token}`
    }}).subscribe({
      next: () => {
        this.message = 'Ride created successfully!';
        this.error = '';
        this.resetForm();
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to create ride. Please try again.';
      }
    });
  }

  resetForm() {
    this.ride = {
      origin_stop_id: '',
      destination_stop_id: '',
      departure_time: '',
      available_seats: 1,
      route_id: '',
    };
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('driverDetails');
    window.location.href = '/login';
  }
}
