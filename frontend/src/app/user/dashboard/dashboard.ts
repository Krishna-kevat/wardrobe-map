import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  products: any[] = [];
  wishlistIds: Set<string> = new Set();
  loading = true;
  error = '';

  categoryFilter = '';
  selectedSizes: { [productId: string]: string } = {};

  constructor(
    public userService: UserService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
    if (this.userService.isLoggedIn()) {
      this.loadWishlist();
    }
  }

  loadProducts() {
    this.loading = true;
    this.userService.getProducts(this.categoryFilter).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.products = res.data;
          this.products.forEach((p: any) => {
            this.selectedSizes[p._id] = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : 'N/A';
          });
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load store products';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.wishlistIds = new Set(res.data.map((item: any) => item._id));
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => console.error('Failed to load wishlist', err)
    });
  }

  toggleWishlist(product: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.wishlistIds.has(product._id)) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.wishlistIds.delete(product._id);
            this.cdr.detectChanges();
          }
        }
      });
    } else {
      this.wishlistService.addToWishlist(product._id).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.wishlistIds.add(product._id);
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  onFilterChange(category: string) {
    this.categoryFilter = category;
    this.loadProducts();
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const size = this.selectedSizes[product._id] || 'N/A';
    this.cartService.addToCart(product, 1, size);
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? 'https://wardrobe-backend-8v0j.onrender.com' + imagePath : 'assets/no-img.png';
  }
}
