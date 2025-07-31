import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { AuthService } from '../../services/auth.service';
import { ProductsTabComponent } from './tabs/products-tab/products-tab.component';
import { OrdersTabComponent } from './tabs/orders-tab/orders-tab.component';
import { AnalyticsTabComponent } from './tabs/analytics-tab/analytics-tab.component';
import { AdminUser } from '../../models/admin-user';
import { HiladosTabComponent } from './tabs/hilados-tab/hilados-tab.component';
import { SettingsTabComponent } from './tabs/settings-tab/settings-tab.component';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { CustomersTabComponent } from './tabs/customers-tab/customers-tab.component';

@Component({
    selector: 'app-admin-customization',
    imports: [
        CommonModule,
        RouterLink,
        TabsModule,
        Button,
        Toast,
        ConfirmDialog,
        ProductsTabComponent,
        OrdersTabComponent,
        HiladosTabComponent,
        AnalyticsTabComponent,
        SettingsTabComponent,
        CustomersTabComponent
    ],
    providers: [],
    templateUrl: './admin-tabs.component.html',
    styleUrl: './admin-tabs.component.scss'
})
export class AdminTabsComponent implements OnInit, AfterViewInit {

    activeTabIndex: string = '0';
    currentUser: AdminUser | null = null;

    private showLoginSuccess = false;

    constructor(
        private authService: AuthService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        if (history.state.loginSuccess) {
            this.showLoginSuccess = true;
        }
    }

    ngAfterViewInit() {
        if (this.showLoginSuccess) {
            this.messageService.add({
                severity: 'success',
                summary: 'Inicio de sesión exitoso',
                detail: 'Bienvenido al panel de administración',
                life: 3000
            });
            this.showLoginSuccess = false;
            // Clear the state to prevent showing on page reload
            history.replaceState({}, '', window.location.href);
        }
    }

    logout(): void {
        this.authService.logout();
    }

} 