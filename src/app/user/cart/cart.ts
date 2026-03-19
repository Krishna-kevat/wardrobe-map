import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart {

  constructor(public cartService: CartService) { }

  updateQuantity(productId: string, size: string, newQuantity: number) {
    if (newQuantity >= 1) {
      this.cartService.updateQuantity(productId, size, newQuantity);
    }
  }

  removeItem(productId: string, size: string) {
    if (confirm('Are you sure you want to remove this item?')) {
      this.cartService.removeFromCart(productId, size);
    }
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart();
    }
  }

  getImageUrl(imagePath: string | undefined): string {
    return imagePath ? 'http://localhost:5000' + imagePath : 'assets/no-img.png';
  }
}
