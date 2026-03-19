import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:5000/api/admin';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        return new HttpHeaders({
            Authorization: `Bearer ${this.authService.getToken()}`
        });
    }

    // Dashboard
    getDashboardStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard`, { headers: this.getHeaders() });
    }

    // Users
    getUsers(search?: string, status?: string): Observable<any> {
        let params = '';
        if (search) params += `search=${search}&`;
        if (status) params += `status=${status}`;
        return this.http.get(`${this.apiUrl}/users?${params}`, { headers: this.getHeaders() });
    }

    getUser(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
    }

    updateUserStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${id}/status`, { status }, { headers: this.getHeaders() });
    }

    resetUserPassword(id: string, password: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${id}/reset-password`, { password }, { headers: this.getHeaders() });
    }

    // Products
    getProducts(category?: string): Observable<any> {
        let params = category ? `?category=${category}` : '';
        return this.http.get(`${this.apiUrl}/products${params}`, { headers: this.getHeaders() });
    }

    createProduct(formData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/products`, formData, { headers: this.getHeaders() });
    }

    updateProduct(id: string, formData: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/products/${id}`, formData, { headers: this.getHeaders() });
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
    }

    // Orders
    getOrders(status?: string, search?: string): Observable<any> {
        let params = '';
        if (search) params += `search=${search}&`;
        if (status) params += `status=${status}`;
        return this.http.get(`${this.apiUrl}/orders?${params}`, { headers: this.getHeaders() });
    }

    updateOrderStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status }, { headers: this.getHeaders() });
    }
}
