import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RideRequest } from './driver.service';
import { DriverService } from './driver.service';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {
  private readonly BASE_URL = 'http://127.0.0.1:42099';
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  private pendingRequestsSubject = new BehaviorSubject<RideRequest[]>([]);
  private allRequestsSubject = new BehaviorSubject<RideRequest[]>([]);
  
  pendingRequests$ = this.pendingRequestsSubject.asObservable();
  allRequests$ = this.allRequestsSubject.asObservable();

  private requestPollingInterval: any;

  constructor(
    private http: HttpClient,
    private driverService: DriverService
  ) {}

  get pendingRequests() { return this.pendingRequestsSubject.value; }
  get allRequests() { return this.allRequestsSubject.value; }

  loadRideRequests(): Observable<RideRequest[]> {
    return new Observable(observer => {
      const token = localStorage.getItem('token');
      const driverId = this.driverService.driverDetails.driver_id;
      
      if (!token || !driverId) {
        console.error('No token or driver ID found for ride requests');
        observer.error('Authentication required');
        return;
      }

      const endpoint = `${this.BASE_URL}/ride-requests/driver/${driverId}`;
      
      this.http.get<any>(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          console.log('Ride requests response:', response);
          
          let requests: RideRequest[] = [];
          
          if (Array.isArray(response)) {
            requests = response;
          } else if (response && Array.isArray(response.requests)) {
            requests = response.requests;
          } else if (response && Array.isArray(response.data)) {
            requests = response.data;
          } else {
            console.log('Unexpected response format:', response);
            requests = [];
          }

          this.allRequestsSubject.next(requests);
          const pendingRequests = requests.filter(r => 
            r.status === 'Pending' || r.status === 'pending' || r.status === 'PENDING'
          );
          this.pendingRequestsSubject.next(pendingRequests);
          
          console.log('Processed ride requests:', {
            total: requests.length,
            pending: pendingRequests.length
          });
          
          observer.next(requests);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to load ride requests:', err);
          this.driverService.setError(`Failed to load ride requests: ${err.message || 'Unknown error'}`);
          
          this.allRequestsSubject.next([]);
          this.pendingRequestsSubject.next([]);
          observer.error(err);
        }
      });
    });
  }

  // Accept a ride request
  acceptRideRequest(requestId: number): Observable<any> {
    const token = localStorage.getItem('token');
    
    return new Observable(observer => {
      this.http.patch(`${this.BASE_URL}/ride-requests/${requestId}`,
        { status: 'Accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: (response) => {
          this.driverService.setMessage('Ride request accepted successfully!');
          
          this.loadRideRequests().subscribe();
          
          const request = this.pendingRequests.find(r => r.request_id === requestId);
          if (request) {
            this.driverService.sendNotificationToRider(
              request.rider_id, 
              'Your ride request has been accepted!'
            ).subscribe({
              next: () => console.log('Notification sent to rider'),
              error: (err) => console.error('Failed to send notification:', err)
            });
          }
          
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to accept ride request:', err);
          this.driverService.setError('Failed to accept ride request');
          observer.error(err);
        }
      });
    });
  }

  // Reject a ride request
  rejectRideRequest(requestId: number): Observable<any> {
    const token = localStorage.getItem('token');
    
    return new Observable(observer => {
      this.http.patch(`${this.BASE_URL}/ride-requests/${requestId}`, 
        { status: 'Rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: (response) => {
          this.driverService.setMessage('Ride request rejected');
          
          this.loadRideRequests().subscribe();
          
          const request = this.pendingRequests.find(r => r.request_id === requestId);
          if (request) {
            this.driverService.sendNotificationToRider(
              request.rider_id, 
              'Your ride request has been rejected.'
            ).subscribe({
              next: () => console.log('Notification sent to rider'),
              error: (err) => console.error('Failed to send notification:', err)
            });
          }
          
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Failed to reject ride request:', err);
          this.driverService.setError('Failed to reject ride request');
          observer.error(err);
        }
      });
    });
  }

  startRequestPolling() {
    console.log('Starting request polling...');
    this.stopRequestPolling(); 

    this.loadRideRequests().subscribe();
    

    this.requestPollingInterval = setInterval(() => {
      console.log('Polling for ride requests...');
      this.loadRideRequests().subscribe();
    }, this.POLLING_INTERVAL);
  }

  stopRequestPolling() {
    if (this.requestPollingInterval) {
      console.log('Stopping request polling...');
      clearInterval(this.requestPollingInterval);
      this.requestPollingInterval = null;
    }
  }
}