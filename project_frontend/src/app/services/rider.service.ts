import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface RiderDetails {
  rider_id: string;
  rider_name: string;
  email: string;
  phone_number: string;
  gender: string;
  is_verified: boolean;
  role_id: string;
  create_datetime: string;
  driver_id: string | null;
  start_stop_id?: string;
  destination_stop_id?: string;
}

export interface Stop {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiderService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';
  
  // Shared state
  private riderDetailsSubject = new BehaviorSubject<RiderDetails>({
    rider_id: '',
    rider_name: '',
    email: '',
    phone_number: '',
    gender: '',
    is_verified: false,
    role_id: '',
    create_datetime: '',
    driver_id: null,
    start_stop_id: '',
    destination_stop_id: ''
  });
  
  private messageSubject = new BehaviorSubject<string>('');
  private messageTypeSubject = new BehaviorSubject<'success' | 'error'>('success');
  private stopsSubject = new BehaviorSubject<any[]>([]);
  
  // Public observables
  riderDetails$ = this.riderDetailsSubject.asObservable();
  message$ = this.messageSubject.asObservable();
  messageType$ = this.messageTypeSubject.asObservable();
  stops$ = this.stopsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Getters for current values
  get riderDetails() { return this.riderDetailsSubject.value; }
  get message() { return this.messageSubject.value; }
  get messageType() { return this.messageTypeSubject.value; }
  get stops() { return this.stopsSubject.value; }

  // Message management
  showMessage(text: string, type: 'success' | 'error') {
    this.messageSubject.next(text);
    this.messageTypeSubject.next(type);
    
    setTimeout(() => {
      this.messageSubject.next('');
    }, 5000);
  }

  clearMessage() {
    this.messageSubject.next('');
  }

  // Initialize rider data
  loadRiderData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (!token) {
        reject('No token found');
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const riderId = decoded.sub?.user_id || decoded.user_id || decoded.sub;
        
        if (!riderId) {
          reject('User ID not found in token');
          return;
        }

        this.loadRiderDetails(riderId, token).then(() => {
          resolve();
        }).catch(reject);
      } catch (error) {
        reject('Error decoding token');
      }
    });
  }

  private loadRiderDetails(riderId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.BASE_URL}/users/${riderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (rider) => {
          const riderDetails: RiderDetails = {
            rider_id: rider.user_id,
            rider_name: rider.user_name || rider.name || 'Unknown User',
            gender: rider.gender || 'Not specified',
            phone_number: rider.phone_number || '',
            start_stop_id: rider.start_stop_id || '',
            destination_stop_id: rider.destination_stop_id || '',
            email: rider.email || '',
            is_verified: rider.is_verified || false,
            role_id: rider.role_id || '',
            create_datetime: rider.create_datetime || '',
            driver_id: rider.driver_id || null
          };
          
          this.riderDetailsSubject.next(riderDetails);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load rider info:', err);
          this.showMessage('Failed to load user information', 'error');
          reject(err);
        }
      });
    });
  }

  // Load stops data
  loadStops(): Observable<any[]> {
    return new Observable(observer => {
      this.http.get<any[]>(`${this.BASE_URL}/stops`).subscribe({
        next: (stopsData) => {
          const stops = Array.isArray(stopsData) ? stopsData : [];
          this.stopsSubject.next(stops);
          observer.next(stops);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to fetch stops:', err);
          this.showMessage('Failed to load stops data', 'error');
          observer.error(err);
        }
      });
    });
  }

  // Load source stops
  loadSourceStops(): Observable<Stop[]> {
    return new Observable(observer => {
      this.http.get<any[]>(`${this.BASE_URL}/route-stops/sources`).subscribe({
        next: (sourcesData) => {
          const sourceStops = sourcesData.map(stop => ({
            id: stop.stop_id,
            name: stop.stop_name
          }));
          observer.next(sourceStops);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to fetch sources:', err);
          this.showMessage('Failed to load source locations', 'error');
          observer.error(err);
        }
      });
    });
  }

  // Update rider profile
  updateProfile(updateData: Partial<RiderDetails>): Observable<any> {
    const token = localStorage.getItem('token');
    const riderId = this.riderDetails.rider_id;

    if (!token || !riderId) {
      return new Observable(observer => {
        observer.error('Authentication required');
      });
    }

    const updatePayload = {
      user_name: updateData.rider_name,
      start_stop_id: updateData.start_stop_id,
      destination_stop_id: updateData.destination_stop_id,
      gender: updateData.gender
    };

    return new Observable(observer => {
      this.http.put(`${this.BASE_URL}/users/${riderId}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          // Update local state
          const updatedDetails = { ...this.riderDetails, ...updateData };
          this.riderDetailsSubject.next(updatedDetails);
          this.showMessage('Profile updated successfully!', 'success');
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
          this.showMessage('Failed to update profile', 'error');
          observer.error(err);
        }
      });
    });
  }

  // Get stop name utility
  getStopName(stopId: string): string {
    const stop = this.stops.find(s => s.stop_id === stopId);
    return stop ? stop.stop_name : `Stop ${stopId}`;
  }

  // Format date time utility
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Format message time utility
  formatMessageTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }
}