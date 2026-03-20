import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {
  product: any = null;
  loading = true;
  error = '';
  quantity = 1;
  isInWishlist = false;
  selectedSize = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProductDetails(id);
      } else {
        this.router.navigate(['/user']);
      }
    });
  }

  fetchProductDetails(id: string) {
    this.loading = true;
    this.userService.getProductById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.product = res.data;
          this.selectedSize = (this.product.sizes && this.product.sizes.length > 0) ? this.product.sizes[0] : 'N/A';
          this.checkWishlistStatus(id);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load product details';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  checkWishlistStatus(productId: string) {
    if (this.userService.isLoggedIn()) {
      this.wishlistService.getWishlist().subscribe({
        next: (res: any) => {
          if (res.success) {
            this.isInWishlist = res.data.some((item: any) => item._id === productId);
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  toggleWishlist(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product._id).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.isInWishlist = false;
            this.cdr.detectChanges();
          }
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.product._id).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.isInWishlist = true;
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity, this.selectedSize);
      // Optional: Give feedback or redirect
      alert('Added to cart!');
    }
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? 'http://localhost:5000' + imagePath : 'assets/no-img.png';
  }
}
