import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
    orders: any[] = [];
    loading = true;
    error = '';

    // Filtering & Search
    searchTerm = '';
    statusFilter = '';

    constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.adminService.getOrders(this.statusFilter, this.searchTerm).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.orders = res.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load orders';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }

    onFilterChange() {
        this.loadOrders();
    }

    onSearchChange() {
        this.loadOrders();
    }

    updateOrderStatus(order: any, newStatus: string) {
        if (order.status === newStatus) return;

        if (confirm(`Change order status to ${newStatus}?`)) {
            const originalStatus = order.status;
            order.status = newStatus; // Optimistic UI update

            this.adminService.updateOrderStatus(order._id, newStatus).subscribe({
                next: (res: any) => {
                    // Success
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    alert('Failed to update status: ' + (err.error?.message || err.message));
                    order.status = originalStatus; // Revert on failure
                    this.cdr.detectChanges();
                }
            });
        }
    }

    isOptionDisabled(currentStatus: string, optionStatus: string): boolean {
        // If current status is the same as the option, it's not strictly "disabled" 
        // because it's the currently selected value, but it's handled by select behavior.
        if (currentStatus === optionStatus) return false;

        if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') {
            return true; // Terminal states, cannot change to anything
        }

        if (currentStatus === 'Pending') {
            // From pending, you can only go to Shipped or Cancelled
            return !['Shipped', 'Cancelled'].includes(optionStatus);
        }

        if (currentStatus === 'Shipped') {
            // From shipped, you can only go to Delivered
            return optionStatus !== 'Delivered';
        }

        return false;
    }
}
