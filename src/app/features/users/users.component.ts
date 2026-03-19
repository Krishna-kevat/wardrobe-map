import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    users: any[] = [];
    loading = true;
    error = '';

    // Filtering & Pagination
    searchTerm = '';
    statusFilter = '';

    constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getUsers(this.searchTerm, this.statusFilter).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.users = res.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load users';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }

    onSearchChange() {
        this.loadUsers();
    }

    onFilterChange() {
        this.loadUsers();
    }

    toggleStatus(user: any) {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        if (confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} this user?`)) {
            this.adminService.updateUserStatus(user._id, newStatus).subscribe({
                next: () => {
                    user.status = newStatus;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    alert('Failed to update status');
                    console.error(err);
                }
            });
        }
    }

    resetPassword(user: any) {
        const newPassword = prompt(`Enter a new password for ${user.full_name} (min 6 characters):`);

        if (newPassword !== null) {
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            if (confirm(`Are you sure you want to reset the password for ${user.email}?`)) {
                this.adminService.resetUserPassword(user._id, newPassword).subscribe({
                    next: (res: any) => {
                        alert(`Password for ${user.full_name} has been safely reset!\n\nThe user can now securely view their new password on the login page.`);
                        user.resetPasswordRequest = false; // Clear the flag in the UI
                        this.cdr.detectChanges();
                    },
                    error: (err: any) => {
                        alert('Failed to reset password: ' + (err.error?.message || err.message));
                        console.error(err);
                    }
                });
            }
        }
    }
}
