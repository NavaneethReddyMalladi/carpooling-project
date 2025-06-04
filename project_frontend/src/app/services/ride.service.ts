import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ride {
  ride_id: number;
  driver_name?: string;
  origin_stop?: string;
  destination_stop?: string;
  start_time?: string;
  available_seats?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = '/rider/search';  // Adjust base URL as needed

  constructor(private http: HttpClient) { }

  searchRides(originStopId: number, destinationStopId: number): Observable<Ride[]> {
    const url = `${this.apiUrl}?origin_stop_id=${originStopId}&destination_stop_id=${destinationStopId}`;
    return this.http.get<Ride[]>(url);
  }
}
