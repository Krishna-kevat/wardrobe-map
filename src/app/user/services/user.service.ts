import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:5000/api/public';

    constructor(private http: HttpClient, private router: Router) { }

    private getHeaders() {
        const token = localStorage.getItem('user_token');
        return {
            Authorization: `Bearer ${token}`
        };
    }

    // --- Authentication ---

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => {
                if (res.data && res.data.token) {
                    localStorage.setItem('user_token', res.data.token);
                    localStorage.setItem('user_name', res.data.full_name);
                }
            }),
            catchError(err => throwError(() => err))
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res.data && res.data.token && res.data.role !== 'admin') {
                    localStorage.setItem('user_token', res.data.token);
                    localStorage.setItem('user_name', res.data.full_name);
                }
            }),
            catchError(err => throwError(() => err))
        );
    }

    logout() {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_name');
        window.location.href = '/';
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('user_token');
    }

    getUserName(): string | null {
        return localStorage.getItem('user_name');
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    retrieveNewPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/retrieve-password`, { email });
    }

    // --- Core Storefront ---

    getProducts(category?: string): Observable<any> {
        let params = category ? `?category=${category}` : '';
        return this.http.get(`${this.apiUrl}/products${params}`);
    }

    getProductById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/products/${id}`);
    }

    checkout(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/checkout`, orderData, { headers: this.getHeaders() });
    }

    getMyOrders(): Observable<any> {
        return this.http.get(`${this.apiUrl}/my-orders`, { headers: this.getHeaders() });
    }

    cancelOrder(orderId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/my-orders/${orderId}/cancel`, {}, { headers: this.getHeaders() });
    }
}
