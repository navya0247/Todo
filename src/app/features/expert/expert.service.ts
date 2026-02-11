import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExpertService {
    private apiUrl = 'http://127.0.0.1:3000';
    private http = inject(HttpClient);

    registerOnboarding(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/expertOnboarding`, data);
    }

    getOnboarding(expertId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/expertOnboarding?expertId=${expertId}`);
    }

    updateProfile(expertId: string, profile: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/expertProfiles/${expertId}`, profile);
    }
}
