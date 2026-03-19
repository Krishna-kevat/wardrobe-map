import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../user/services/user.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    authForm!: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

    // UI State
    isLoginMode: boolean = true;
    isForgotPasswordMode: boolean = false;
    isRetrievePasswordMode: boolean = false;
    retrievedPassword: string | null = null;
    returnUrl: string = '/user';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/user';

        // Redirect if already logged in based on role
        if (this.authService.hasToken()) {
            this.router.navigate(['/admin/dashboard']);
        } else if (this.userService.isLoggedIn()) {
            this.router.navigate([this.returnUrl]);
        }

        this.initForm();
    }

    initForm() {
        if (this.isLoginMode) {
            this.authForm = this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]]
            });
        } else {
            // Customer Registration
            this.authForm = this.fb.group({
                full_name: ['', Validators.required],
                mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                address: ['', Validators.required],
                city: ['', Validators.required],
                state: ['', Validators.required],
                pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
            });
        }
    }

    toggleForgotPassword() {
        this.isForgotPasswordMode = true;
        this.isLoginMode = false;
        this.isRetrievePasswordMode = false;
        this.retrievedPassword = null;
        this.errorMessage = '';
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    toggleRetrievePassword() {
        this.isRetrievePasswordMode = true;
        this.isLoginMode = false;
        this.isForgotPasswordMode = false;
        this.retrievedPassword = null;
        this.errorMessage = '';
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.isForgotPasswordMode = false;
        this.isRetrievePasswordMode = false;
        this.retrievedPassword = null;
        this.errorMessage = '';
        this.initForm();
    }

    onSubmit() {
        if (this.authForm.invalid) {
            this.authForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        if (this.isForgotPasswordMode) {
            this.userService.requestPasswordReset(this.authForm.value.email).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    alert(res.message);
                    this.toggleForgotPassword(); // Go back to login
                },
                error: (err: any) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Failed to request password reset.';
                }
            });
            return;
        }

        if (this.isRetrievePasswordMode) {
            this.userService.retrieveNewPassword(this.authForm.value.email).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    this.retrievedPassword = res.newPassword;
                    if (res.newPassword) {
                        alert(`Your new password is: ${res.newPassword}`);
                    }
                },
                error: (err: any) => {
                    this.isLoading = false;
                    console.error('Retrieve Password Error:', err);
                    this.errorMessage = err.error?.message || err.message || 'Failed to retrieve password. Ensure your email is correct and your password was actually reset.';
                    alert('Error: ' + this.errorMessage);
                }
            });
            return;
        }

        const authCall = this.isLoginMode
            ? this.userService.login(this.authForm.value)
            : this.userService.register(this.authForm.value);

        authCall.subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.success) {
                    if (res.data && res.data.role === 'admin') {
                        // Handle Admin Login
                        localStorage.setItem('admin_token', res.data.token);
                        this.authService.isLoggedIn.set(true);
                        this.router.navigate(['/admin/dashboard']);
                    } else {
                        // User login is already handled by userService.login tap
                        this.router.navigateByUrl(this.returnUrl);
                    }
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Authentication failed. Please try again.';
            }
        });
    }

    // Getters for form controls
    get email() { return this.authForm.get('email'); }
    get password() { return this.authForm.get('password'); }
    get full_name() { return this.authForm.get('full_name'); }
    get mobile_number() { return this.authForm.get('mobile_number'); }
    get address() { return this.authForm.get('address'); }
    get city() { return this.authForm.get('city'); }
    get state() { return this.authForm.get('state'); }
    get pincode() { return this.authForm.get('pincode'); }
}
