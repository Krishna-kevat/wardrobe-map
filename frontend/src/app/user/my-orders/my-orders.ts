import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    providers: [DatePipe],
    templateUrl: './my-orders.html',
    styleUrls: ['./my-orders.css']
})
export class MyOrders implements OnInit {
    orders: any[] = [];
    loading = true;
    error = '';

    constructor(private userService: UserService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.fetchMyOrders();
    }

    fetchMyOrders() {
        this.loading = true;
        this.userService.getMyOrders().subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.orders = res.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load your orders.';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }

    cancelOrder(orderId: string) {
        if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            this.userService.cancelOrder(orderId).subscribe({
                next: (res: any) => {
                    if (res.success) {
                        alert('Order cancelled successfully.');
                        this.fetchMyOrders(); // Reload orders to get updated status
                    }
                },
                error: (err: any) => {
                    alert('Failed to cancel order: ' + (err.error?.message || err.message));
                }
            });
        }
    }
}
