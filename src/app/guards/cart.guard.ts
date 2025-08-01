import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CarritoService } from '../services/carrito.service';

@Injectable({
    providedIn: 'root'
})
export class CartGuard implements CanActivate {

    constructor(
        private carritoService: CarritoService,
        private router: Router
    ) { }

    canActivate(): boolean {
        const cartItems = this.carritoService.getCarrito();

        if (cartItems.length === 0) {
            // Redirect to cart page if cart is empty
            this.router.navigate(['/carrito']);
            return false;
        }

        return true;
    }

} 