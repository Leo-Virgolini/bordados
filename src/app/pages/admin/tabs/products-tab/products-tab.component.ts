import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbroidedProductsTabComponent } from './embroided-products-tab/embroided-products-tab.component';
import { CustomizedProductsTabComponent } from './customized-products-tab/customized-products-tab.component';
import { TabsModule } from 'primeng/tabs';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-products-tab',
  imports: [
    CommonModule,
    EmbroidedProductsTabComponent,
    CustomizedProductsTabComponent,
    Card,
    TabsModule
  ],
  templateUrl: './products-tab.component.html',
  styleUrl: './products-tab.component.scss'
})
export class ProductsTabComponent {
  activeTabIndex: string = '0';
}
