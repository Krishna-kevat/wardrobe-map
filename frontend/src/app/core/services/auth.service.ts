import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/admin';

    // Signal to store if user is logged in
    isLoggedIn = signal<boolean>(this.hasToken());

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: any) {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res.token) {
                    localStorage.setItem('admin_token', res.token);
                    this.isLoggedIn.set(true);
                }
            }),
            catchError((err: any) => {
                return throwError(() => new Error(err.error?.message || 'Login failed'));
            })
        );
    }

    logout() {
        localStorage.removeItem('admin_token');
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        return localStorage.getItem('admin_token');
    }

    hasToken(): boolean {
        return !!this.getToken();
    }
}
