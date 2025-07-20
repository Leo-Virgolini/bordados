import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { AuthService } from '../../services/auth.service';
import { ProductsTabComponent } from './tabs/products-tab/products-tab.component';
import { SalesTabComponent } from './tabs/sales-tab/sales-tab.component';
import { AnalyticsTabComponent } from './tabs/analytics-tab/analytics-tab.component';
import { AdminUser } from '../../model/admin-user';
import { CustomizationTabComponent } from './tabs/customization-tab/customization-tab.component';
import { SettingsTabComponent } from './tabs/settings-tab/settings-tab.component';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-admin-customization',
    imports: [
        CommonModule,
        RouterLink,
        TabsModule,
        Button,
        Toast,
        ProductsTabComponent,
        SalesTabComponent,
        CustomizationTabComponent,
        AnalyticsTabComponent,
        SettingsTabComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-tabs.component.html',
    styleUrl: './admin-tabs.component.scss'
})
export class AdminTabsComponent implements OnInit {

    activeTabIndex: string = '0';
    currentUser: AdminUser | null = null;

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
    }

    logout(): void {
        this.authService.logout();
    }

} 