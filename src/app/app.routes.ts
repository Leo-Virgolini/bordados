import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'productos', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
            { path: 'personalizar', loadComponent: () => import('./pages/customize/customize.component').then(m => m.CustomizeComponent) },
            { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent) },
            { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) }
        ]
    },
    {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
