import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stop {
  stop_id: number;
  stop_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class StopService {
  private apiUrl = '/stops';

  constructor(private http: HttpClient) { }

  getStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.apiUrl);
  }
}
