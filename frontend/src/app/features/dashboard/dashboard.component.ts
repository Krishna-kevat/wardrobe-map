import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    stats: any = {
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0
    };
    recentOrders: any[] = [];
    loading: boolean = true;
    error: string = '';

    constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.adminService.getDashboardStats().subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.stats = res.data.totals;
                    this.recentOrders = res.data.recentOrders;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load dashboard statistics.';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }
}
