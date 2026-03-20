import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {

    constructor(
        public cartService: CartService,
        public userService: UserService
    ) { }

    onLogout(event: Event) {
        event.preventDefault();
        this.userService.logout();
    }
}
