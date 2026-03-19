import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './wishlist.component.html',
    styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
    wishlistItems: any[] = [];
    loading = true;
    error = '';

    constructor(
        private wishlistService: WishlistService,
        private cartService: CartService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.fetchWishlist();
    }

    fetchWishlist() {
        this.loading = true;
        this.wishlistService.getWishlist().subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.wishlistItems = res.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load your wishlist.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    removeFromWishlist(productId: string) {
        this.wishlistService.removeFromWishlist(productId).subscribe({
            next: (res: any) => {
                if (res.success) {
                    // Remove from local array
                    this.wishlistItems = this.wishlistItems.filter(item => item._id !== productId);
                    this.cdr.detectChanges();
                }
            },
            error: (err: any) => {
                console.error('Failed to remove from wishlist', err);
            }
        });
    }

    addToCart(product: any) {
        this.cartService.addToCart(product);
        alert('Added to cart!');
    }

    getImageUrl(imagePath: string): string {
        return imagePath ? 'http://localhost:5000' + imagePath : 'assets/no-img.png';
    }
}
