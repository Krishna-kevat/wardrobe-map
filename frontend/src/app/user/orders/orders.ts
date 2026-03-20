import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  orderId: string | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['orderId']) {
      this.orderId = navigation.extras.state['orderId'];
    }
  }

  ngOnInit() {
    if (!this.orderId) {
      // If someone just navigated here without an order ID state, redirect to home
      this.router.navigate(['/user']);
    }
  }
}
