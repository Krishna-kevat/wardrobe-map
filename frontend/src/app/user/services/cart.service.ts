import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image?: string;
    stock: number;
    size: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItemsSignal = signal<CartItem[]>(this.loadCart());

    // Computed Signals for easy tracking
    items = this.cartItemsSignal.asReadonly();
    totalQuantity = computed(() => this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0));
    subTotal = computed(() => this.cartItemsSignal().reduce((acc, item) => acc + (item.price * item.quantity), 0));

    constructor() { }

    private loadCart(): CartItem[] {
        const saved = localStorage.getItem('wardrobe_cart');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    private saveCart(items: CartItem[]) {
        localStorage.setItem('wardrobe_cart', JSON.stringify(items));
        this.cartItemsSignal.set(items);
    }

    addToCart(product: any, quantity: number = 1, size: string = 'N/A') {
        const currentItems = [...this.cartItemsSignal()];
        const existingIndex = currentItems.findIndex(item => item.product_id === product._id && item.size === size);

        if (existingIndex >= 0) {
            // Check stock limit
            if (currentItems[existingIndex].quantity + quantity <= product.stock) {
                currentItems[existingIndex].quantity += quantity;
            } else {
                alert('Cannot add more than available stock.');
                return;
            }
        } else {
            if (quantity <= product.stock) {
                currentItems.push({
                    product_id: product._id,
                    product_name: product.product_name,
                    price: product.price,
                    image: product.image,
                    stock: product.stock,
                    size: size,
                    quantity: quantity
                });
            } else {
                alert('Cannot add more than available stock.');
                return;
            }
        }

        this.saveCart(currentItems);
    }

    updateQuantity(productId: string, size: string, quantity: number) {
        let currentItems = [...this.cartItemsSignal()];
        const index = currentItems.findIndex(item => item.product_id === productId && item.size === size);

        if (index >= 0) {
            if (quantity <= 0) {
                currentItems.splice(index, 1);
            } else if (quantity <= currentItems[index].stock) {
                currentItems[index].quantity = quantity;
            } else {
                alert('Cannot exceed stock.');
            }
            this.saveCart(currentItems);
        }
    }

    removeFromCart(productId: string, size: string) {
        const currentItems = this.cartItemsSignal().filter(item => !(item.product_id === productId && item.size === size));
        this.saveCart(currentItems);
    }

    clearCart() {
        this.saveCart([]);
        localStorage.removeItem('wardrobe_cart');
    }
}
