import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { HiladosTabComponent } from './hilados-tab/hilados-tab.component';
import { ProductTypesTabComponent } from './product-types-tab/product-types-tab.component';


@Component({
    selector: 'app-customization-tab',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        HiladosTabComponent,
        ProductTypesTabComponent
    ],
    templateUrl: './customization-tab.component.html',
    styleUrls: ['./customization-tab.component.scss']
})
export class CustomizationTabComponent {

    activeTabIndex = 0;

} 