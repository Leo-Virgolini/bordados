import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'productos', loadComponent: () => import('./pages/products-sale/products-sale.component').then(m => m.ProductsSaleComponent) },
            { path: 'personalizar', loadComponent: () => import('./pages/customize/customize.component').then(m => m.CustomizeComponent) },
            { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent) },
            { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent) },
            { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) }
        ]
    },
    {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
            { path: '', loadComponent: () => import('./pages/admin/admin-tabs.component').then(m => m.AdminTabsComponent) }
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
