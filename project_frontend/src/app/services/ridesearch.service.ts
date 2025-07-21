import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RiderService, Stop } from './rider.service';

export interface Ride {
  ride_id?: string;
  driver_name: string;
  driver_id?: string;
  origin_stop_id: string;
  destination_stop_id: string;
  departure_time: string;
  available_seats?: number;
  seats?: number;
  price?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideSearchService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';

  private ridesSubject = new BehaviorSubject<Ride[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private selectedRideSubject = new BehaviorSubject<Ride | null>(null);
  private isBookingSubject = new BehaviorSubject<boolean>(false);
  
  rides$ = this.ridesSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  selectedRide$ = this.selectedRideSubject.asObservable();
  isBooking$ = this.isBookingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private riderService: RiderService
  ) {}


  get rides() { return this.ridesSubject.value; }
  get isLoading() { return this.isLoadingSubject.value; }
  get selectedRide() { return this.selectedRideSubject.value; }
  get isBooking() { return this.isBookingSubject.value; }

 
  loadDestinationStops(sourceStopId: string): Observable<Stop[]> {
    return new Observable(observer => {
      this.http.get<any>(`${this.BASE_URL}/route-stops/destinations`, {
        params: new HttpParams().set('source_stop_id', sourceStopId)
      }).subscribe({
        next: (destResponse) => {
          let destinations = [];
    
          if (Array.isArray(destResponse)) {
            destinations = destResponse;
          } else if (Array.isArray(destResponse.destinations)) {
            destinations = destResponse.destinations;
          }

          const uniqueDestIds: string[] = Array.from(
            new Set(
              destinations.map((dest: any) => String(dest.stop_id || dest.end_stop_id))
            )
          );
          
          const destStops = uniqueDestIds.map((stopId: string) => {
            const stopInfo = this.riderService.stops.find(s => String(s.stop_id) === stopId);
            return {
              id: stopId,
              name: stopInfo?.stop_name ?? `Stop ${stopId}`
            };
          });

          observer.next(destStops);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to fetch destinations:', err);
          this.riderService.showMessage('Failed to load destination options', 'error');
          observer.error(err);
        }
      });
    });
  }

  
  searchRides(sourceStopId: string, destStopId: string): Observable<Ride[]> {
    return new Observable(observer => {
      this.isLoadingSubject.next(true);
      this.ridesSubject.next([]);
      
      const params = new HttpParams()
        .set('origin_stop_id', sourceStopId)
        .set('destination_stop_id', destStopId);

      this.http.get<any[]>(`${this.BASE_URL}/rides/search`, { params }).subscribe({
        next: (data) => {
          const rides = Array.isArray(data) ? data : [];
          this.ridesSubject.next(rides);
          this.isLoadingSubject.next(false);
          
          if (rides.length === 0) {
            this.riderService.showMessage('No rides found for this route', 'error');
          }

          observer.next(rides);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to fetch rides:', err);
          this.ridesSubject.next([]);
          this.isLoadingSubject.next(false);
          this.riderService.showMessage('Failed to search for rides', 'error');
          observer.error(err);
        }
      });
    });
  }

  
  selectRide(ride: Ride) {
    this.selectedRideSubject.next(ride);
    
   
    const currentDetails = this.riderService.riderDetails;
    const updatedDetails = {
      ...currentDetails,
      start_stop_id: ride.origin_stop_id,
      destination_stop_id: ride.destination_stop_id
    };
    
  }

  clearSelectedRide() {
    this.selectedRideSubject.next(null);
  }

  bookRide(ride: Ride): Observable<any> {
    return new Observable(observer => {
      this.isBookingSubject.next(true);
      const token = localStorage.getItem('token');
      const riderDetails = this.riderService.riderDetails;

      if (!token) {
        this.riderService.showMessage('Authentication required. Please login again.', 'error');
        this.isBookingSubject.next(false);
        observer.error('No authentication token');
        return;
      }

      const bookingData = {
        ride_id: ride.ride_id,
        rider_id: riderDetails.rider_id,
        rider_name: riderDetails.rider_name,
        start_stop_id: ride.origin_stop_id,
        destination_stop_id: ride.destination_stop_id,
        gender: riderDetails.gender,
        booking_time: new Date().toISOString()
      };

      this.http.post(`${this.BASE_URL}/ride-requests`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          this.riderService.showMessage('Ride booked successfully!', 'success');
          this.clearSelectedRide();
          this.isBookingSubject.next(false);
          
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to book ride:', err);
          this.riderService.showMessage(
            err.error?.message || 'Failed to book ride. Please try again.', 
            'error'
          );
          this.isBookingSubject.next(false);
          observer.error(err);
        }
      });
    });
  }

  refreshResults(sourceStopId: string, destStopId: string) {
    this.searchRides(sourceStopId, destStopId).subscribe();
  }
}