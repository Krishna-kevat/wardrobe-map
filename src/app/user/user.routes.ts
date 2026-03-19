import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';
import { Dashboard } from './dashboard/dashboard';
import { ProductDetails } from './product-details/product-details';
import { Cart } from './cart/cart';
import { Checkout } from './checkout/checkout';
import { Orders } from './orders/orders';
import { MyOrders } from './my-orders/my-orders';
import { WishlistComponent } from './wishlist/wishlist.component';
import { UserAuthGuard } from '../core/guards/user-auth.guard';

export const userRoutes: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: '', component: Dashboard },
            { path: 'product/:id', component: ProductDetails },
            { path: 'cart', component: Cart, canActivate: [UserAuthGuard] },
            { path: 'checkout', component: Checkout, canActivate: [UserAuthGuard] },
            { path: 'my-orders', component: MyOrders, canActivate: [UserAuthGuard] },
            { path: 'wishlist', component: WishlistComponent, canActivate: [UserAuthGuard] },
            { path: 'success', component: Orders }
        ]
    }
];
