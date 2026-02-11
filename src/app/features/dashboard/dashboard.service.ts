import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://127.0.0.1:3000';
    private http = inject(HttpClient);

    getServices(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/services`);
    }

    getBookings(userId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings?customerId=${userId}&_expand=service&_expand=expert`);
        // Note: json-server supports _expand to include related data
    }
}
