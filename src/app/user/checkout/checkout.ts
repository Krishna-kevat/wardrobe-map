import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  checkoutForm!: FormGroup;
  isSubmitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    public cartService: CartService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/user/cart']);
      return;
    }

    this.checkoutForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
      payment_method: ['COD', Validators.required]
    });
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const orderPayload = {
      ...this.checkoutForm.value,
      products: this.cartService.items()
    };

    this.userService.checkout(orderPayload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success) {
          this.cartService.clearCart();
          this.router.navigate(['/user/success'], { state: { orderId: res.data.order_id } });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to place order. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
