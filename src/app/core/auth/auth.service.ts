import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:3000';
    private http = inject(HttpClient);
    private router = inject(Router);

    // Signals to track state reactively if needed
    currentUser = signal<any>(null);

    constructor() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Decode token or user info if stored
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            this.currentUser.set(user);
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => {
                this.setSession(res);
            })
        );
    }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                this.setSession(res);
            })
        );
    }

    private setSession(authResult: any) {
        localStorage.setItem('accessToken', authResult.accessToken);
        if (authResult.user) {
            localStorage.setItem('user', JSON.stringify(authResult.user));
            this.currentUser.set(authResult.user);
        }
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
