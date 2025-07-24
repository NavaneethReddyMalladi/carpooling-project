import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface Stop {
  id: string;
  name: string;
}

export interface Ride {
  ride_id: number;
  origin_stop_id: number;
  destination_stop_id: number;
  departure_time: string;
  available_seats: number;
  status: string;
  created_at?: string;
  fare?: number;
  passenger_count?: number;
  origin_name?: string;
  destination_name?: string;
}

export interface RideRequest {
  request_id: number;
  ride_id: number;
  rider_id: number;
  status: string;
  requested_at: string;
  ride?: {
    origin_name?: string;
    destination_name?: string;
    departure_time?: string;
    available_seats?: number;
  };
  rider?: {
    user_name?: string;
    phone?: string;
    rating?: number;
  };
}

export interface DashboardStats {
  todayEarnings: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  rating: number;
  onlineHours: number;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  formatMessageTime(dateString: string): string {
    throw new Error('Method not implemented.');
  }
  showMessage(arg0: string, arg1: string) {
      throw new Error('Method not implemented.');
  }
  private readonly BASE_URL = 'http://127.0.0.1:42099';
  
  // Shared state
  private driverDetailsSubject = new BehaviorSubject<any>({
    driver_id: '',
    driver_name: '',
    gender: '',
    phone: '',
    email: '',
    rating: 0,
    totalRides: 0,
    status: 'offline'
  });
  
  private isOnlineSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('');
  private errorSubject = new BehaviorSubject<string>('');
  
  // Public observables
  driverDetails$ = this.driverDetailsSubject.asObservable();
  isOnline$ = this.isOnlineSubject.asObservable();
  message$ = this.messageSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Getters for current values
  get driverDetails() { return this.driverDetailsSubject.value; }
  get isOnline() { return this.isOnlineSubject.value; }
  get message() { return this.messageSubject.value; }
  get error() { return this.errorSubject.value; }


  setMessage(message: string) { this.messageSubject.next(message); }
  setError(error: string) { this.errorSubject.next(error); }
  clearMessages() { 
    this.messageSubject.next(''); 
    this.errorSubject.next(''); 
  }

  // Initialize driver data
  loadDriverData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (!token) {
        reject('No token found');
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const driverId = decoded.sub?.user_id || decoded.user_id;
        
        if (!driverId) {
          reject('Driver ID not found in token');
          return;
        }

        this.loadDriverDetails(driverId, token).then(() => {
          resolve();
        }).catch(reject);
      } catch (error) {
        reject('Error decoding token');
      }
    });
  }

  private loadDriverDetails(driverId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.BASE_URL}/users/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (driver) => {
          const driverDetails = {
            driver_id: driver.driver_id || driverId,
            driver_name: driver.user_name,
            gender: driver.gender,
            phone: driver.phone_number || 'Not provided',
            email: driver.email || 'Not provided',
            status: driver.status || 'offline'
          };
          
          this.driverDetailsSubject.next(driverDetails);
          this.isOnlineSubject.next(driverDetails.status === 'online');
          resolve();
        },
        error: (err) => {
          console.error('Failed to load driver info:', err);
          this.setError('Failed to load driver information');
          reject(err);
        }
      });
    });
  }

  loadStops(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/stops`);
  }

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
          this.setError('Failed to load source locations');
          observer.error(err);
        }
      });
    });
  }

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

          this.loadStops().subscribe(stops => {
            const destStops = uniqueDestIds.map((stopId: string) => {
              const stopInfo = stops.find(s => String(s.stop_id) === stopId);
              return {
                id: stopId,
                name: stopInfo?.stop_name ?? `Stop ${stopId}`
              };
            });
            observer.next(destStops);
            observer.complete();
          });
        },
        error: (err) => {
          console.error('Failed to fetch destinations:', err);
          this.setError('Failed to load destination options');
          observer.error(err);
        }
      });
    });
  }

  getStopName(stopId: string, stops: any[]): string {
    const stop = stops.find(s => s.stop_id == stopId);
    return stop ? stop.stop_name : `Stop ${stopId}`;
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleString();
  }

  getRelativeTime(timeString: string): string {
    const now = new Date();
    const time = new Date(timeString);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  sendNotificationToRider(riderId: number, messageText: string): Observable<any> {
    const token = localStorage.getItem('token');
    const messageData = {
      sender_id: this.driverDetails.driver_id,
      receiver_id: riderId,
      message_text: messageText
    };

    return this.http.post(`${this.BASE_URL}/messages`, messageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeBC+J2fPCdSYEK4DL8NiKOAkasKjm7bJgGgU7k9n0unEpBSl8yO3eizEHHnPI7eeXSQwOUqjn77BdGAU9jNrsx2wgBCl+x+3fjzQHG3DF8eeSSgwKTqHh5KVlGgc4mtv0v2kfBit82e7elEMNE1qi5O2eSgoKTqHj5ahVFgtIqd3v1W8aBC16zNzYijMHG3DL8OOaUgsEVKjo1nIpBy16kNvzunUqBSp9yOzfhzEKGW/G7eSXTQsIS6Hl7aNcGgU8jNnuyWwgBCh9x+7ghzIKGXPI7+aVSQsLUKfn76hZFQlHpta0MnkfBCt8xO3bgjMJGnDI8eiSUgwJVKvp3ZlMEAhOo+PqnlgLBzGN2fXKfScBJ33H8dyPQgwSTKDi6alpHgc2k9n0w2sfBSl7zOzeiTcJGG+97d6ONggZdMLx14xADAhRpuHpqVAKDlap2urHfSwEB1Wk5Om0X'); 
      audio.play().catch(e => console.log('Could not play notification sound'));
    } catch (e) {
      console.log('Could not play notification sound');
    }
  }
}