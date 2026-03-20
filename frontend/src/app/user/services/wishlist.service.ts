import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private apiUrl = 'http://localhost:5000/api/public/wishlist';

    constructor(private http: HttpClient) { }

    private getHeaders() {
        const token = localStorage.getItem('user_token');
        return {
            Authorization: `Bearer ${token}`
        };
    }

    getWishlist(): Observable<any> {
        return this.http.get(this.apiUrl, { headers: this.getHeaders() });
    }

    addToWishlist(productId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${productId}`, {}, { headers: this.getHeaders() });
    }

    removeFromWishlist(productId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getHeaders() });
    }
}
