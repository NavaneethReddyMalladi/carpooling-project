import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, DashboardStats } from './driver.service';
import { DriverService } from './driver.service';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private activeRidesSubject = new BehaviorSubject<Ride[]>([]);
  private completedRidesSubject = new BehaviorSubject<Ride[]>([]);
  private cancelledRidesSubject = new BehaviorSubject<Ride[]>([]);
  private recentRidesSubject = new BehaviorSubject<any[]>([]);
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats>({
    todayEarnings: 0,
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    activeRides: 0,
    rating: 0,
    onlineHours: 0
  });


  activeRides$ = this.activeRidesSubject.asObservable();
  completedRides$ = this.completedRidesSubject.asObservable();
  cancelledRides$ = this.cancelledRidesSubject.asObservable();
  recentRides$ = this.recentRidesSubject.asObservable();
  dashboardStats$ = this.dashboardStatsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private driverService: DriverService
  ) {}

  get activeRides() { return this.activeRidesSubject.value; }
  get completedRides() { return this.completedRidesSubject.value; }
  get cancelledRides() { return this.cancelledRidesSubject.value; }
  get recentRides() { return this.recentRidesSubject.value; }
  get dashboardStats() { return this.dashboardStatsSubject.value; }

  loadDriverRides(): Observable<Ride[]> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      const driverId = this.driverService.driverDetails.driver_id;
      
      if (!token || !driverId) {
        console.error('No token or driver ID found');
        observer.error('Authentication required');
        return;
      }

      this.http.get<Ride[]>(`${this.BASE_URL}/rides/driver/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (rides) => {
          console.log('Received rides:', rides);
          
          this.driverService.loadStops().subscribe(stops => {
            const ridesWithNames = rides.map(ride => ({
              ...ride,
              origin_name: this.driverService.getStopName(ride.origin_stop_id.toString(), stops),
              destination_name: this.driverService.getStopName(ride.destination_stop_id.toString(), stops)
            }));

            const activeRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'active');
            const completedRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'completed');
            const cancelledRides = ridesWithNames.filter(r => r.status.toLowerCase() === 'cancelled');

            this.activeRidesSubject.next(activeRides);
            this.completedRidesSubject.next(completedRides);
            this.cancelledRidesSubject.next(cancelledRides);

            const recentRides = ridesWithNames
              .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
              .slice(0, 10)
              .map(ride => ({
                id: ride.ride_id,
                origin: ride.origin_name,
                destination: ride.destination_name,
                time: this.driverService.getRelativeTime(ride.departure_time),
                fare: ride.fare || 0,
                status: ride.status,
                rating: 0 
              }));

            this.recentRidesSubject.next(recentRides);
            
            console.log('Processed rides:', {
              active: activeRides.length,
              completed: completedRides.length,
              cancelled: cancelledRides.length
            });

            observer.next(ridesWithNames);
            observer.complete();
          });
        },
        error: (err) => {
          console.error('Failed to load driver rides:', err);
          this.driverService.setError('Failed to load rides data');
          observer.error(err);
        }
      });
    });
  }
  loadDashboardStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      const driverId = this.driverService.driverDetails.driver_id;
      
      if (!token || !driverId) {
        observer.error('Authentication required');
        return;
      }


      this.http.get<any>(`${this.BASE_URL}/rides/driver/${driverId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (stats) => {
          const dashboardStats: DashboardStats = {
            todayEarnings: stats.todayEarnings || 0,
            totalRides: stats.totalRides || 0,
            completedRides: stats.completedRides || 0,
            cancelledRides: stats.cancelledRides || 0,
            activeRides: stats.activeRides || 0,
            rating: stats.averageRating || 0,
            onlineHours: stats.onlineHours || 0
          };
          
          this.dashboardStatsSubject.next(dashboardStats);
          observer.next(dashboardStats);
          observer.complete();
        },
        error: (err) => {
          console.log('Stats API not available, calculating from rides data');
          this.calculateStatsFromRides().subscribe({
            next: (stats) => {
              observer.next(stats);
              observer.complete();
            },
            error: (calcErr) => observer.error(calcErr)
          });
        }
      });
    });
  }


  private calculateStatsFromRides(): Observable<DashboardStats> {
    return new Observable(observer => {
      this.loadDriverRides().subscribe({
        next: (rides) => {
          const today = new Date().toDateString();
          
          const stats: DashboardStats = {
            totalRides: rides.length,
            completedRides: rides.filter(r => r.status === 'completed').length,
            cancelledRides: rides.filter(r => r.status === 'cancelled').length,
            activeRides: rides.filter(r => r.status === 'active').length,
            todayEarnings: rides
              .filter(r => r.status === 'completed' && new Date(r.departure_time).toDateString() === today)
              .reduce((sum, r) => sum + (r.fare || 0), 0),
            rating: this.driverService.driverDetails.rating || 0,
            onlineHours: 0
          };

          this.dashboardStatsSubject.next(stats);
          observer.next(stats);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to calculate stats from rides:', err);
          observer.error(err);
        }
      });
    });
  }

  createRide(rideData: any): Observable<any> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      const driverId = this.driverService.driverDetails.driver_id;


      if (!rideData.origin_stop_id || !rideData.destination_stop_id || 
          !rideData.departure_time || !rideData.available_seats) {
        observer.error('Please fill all required fields.');
        return;
      }
      
      if (rideData.origin_stop_id === rideData.destination_stop_id) {
        observer.error('Origin and destination cannot be the same.');
        return;
      }

      const departureDate = new Date(rideData.departure_time);
      const now = new Date();
      
      if (departureDate <= now) {
        observer.error('Departure time must be in the future.');
        return;
      }

      const pad = (n: number) => (n < 10 ? '0' + n : n);
      const formattedDepartureTime = 
        `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())} ` +
        `${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:00`;

      const postData = {
        driver_id: driverId,
        origin_stop_id: Number(rideData.origin_stop_id),
        destination_stop_id: Number(rideData.destination_stop_id),
        departure_time: formattedDepartureTime,
        available_seats: Number(rideData.available_seats),
        route_id: rideData.route_id ? Number(rideData.route_id) : null,
        status: 'active'
      };

      this.http.post(`${this.BASE_URL}/rides`, postData, { 
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          console.log('Ride created successfully:', response);
          this.driverService.setMessage('Ride created successfully! Passengers can now book your ride.');
          

          setTimeout(() => {
            this.loadDriverRides().subscribe();
            this.loadDashboardStats().subscribe();
          }, 500);
          
          observer.next(response);
          observer.complete();
        },
        error: err => {
          console.error('Failed to create ride:', err);
          observer.error('Failed to create ride. Please try again.');
        }
      });
    });
  }

  cancelRide(rideId: number): Observable<any> {
    const token = localStorage.getItem('token');
    
    return new Observable(observer => {
      this.http.patch(`${this.BASE_URL}/rides/${rideId}`, 
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: (response) => {
          this.driverService.setMessage('Ride cancelled successfully');
          this.loadDriverRides().subscribe();
          this.loadDashboardStats().subscribe();
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to cancel ride:', err);
          this.driverService.setError('Failed to cancel ride');
          observer.error(err);
        }
      });
    });
  }

  completeRide(rideId: number): Observable<any> {
    const token = localStorage.getItem('token');
    
    return new Observable(observer => {
      this.http.patch(`${this.BASE_URL}/rides/${rideId}`, 
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: (response) => {
          this.driverService.setMessage('Ride marked as completed');
          this.loadDriverRides().subscribe();
          this.loadDashboardStats().subscribe();
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to complete ride:', err);
          this.driverService.setError('Failed to complete ride');
          observer.error(err);
        }
      });
    });
  }
}