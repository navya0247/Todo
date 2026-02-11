import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://127.0.0.1:3000';
  private http = inject(HttpClient);

  getServiceByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services?name=${encodeURIComponent(name)}`);
  }

  getExperts(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/serviceExperts?q=${encodeURIComponent(query)}`);
  }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, bookingData);
  }

  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${bookingId}`, { status });
  }

  getAddresses(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/addresses?customerId=${userId}`);
  }

  addAddress(address: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addresses`, address);
  }

  getCoupons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/coupons?isActive=true`);
  }

  createPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, paymentData);
  }
}
