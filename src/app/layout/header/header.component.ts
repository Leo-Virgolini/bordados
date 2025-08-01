import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menubar } from 'primeng/menubar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Tooltip } from 'primeng/tooltip';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, Menubar, CommonModule, InputText, InputGroup, InputGroupAddon, RouterLink, OverlayBadge, Tooltip],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  private carritoService = inject(CarritoService);

  isDark = signal<boolean>(false);

  // Reactive cart data using signals
  cartUniqueItems = signal<number>(0);
  cartTotal = signal<number>(0);

  // Computed values for display
  cartItemsDisplay = computed(() => {
    const count = this.cartUniqueItems();
    return count > 0 ? count.toString() : '';
  });

  cartTotalFormatted = computed(() => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(this.cartTotal());
  });

  items: MenuItem[] = [
    { label: 'Inicio', icon: PrimeIcons.HOME, routerLink: '/' },
    {
      label: 'Productos', icon: PrimeIcons.SHOPPING_BAG, routerLink: '/productos',
      items: [
        { label: 'Remeras', icon: PrimeIcons.BOX, routerLink: '/productos/remeras' },
        { label: 'Buzos', icon: PrimeIcons.BOX, routerLink: '/productos/buzos' }
      ]
    },
    { label: 'Personalizar', icon: PrimeIcons.PALETTE, routerLink: '/personalizar' },
    { label: 'Contacto', icon: PrimeIcons.ENVELOPE, routerLink: '/contacto' }
  ];

  constructor() {
    // Subscribe to cart changes for reactive updates
    this.carritoService.items$.subscribe(items => {
      // Show unique items count (different products) instead of total quantity
      this.cartUniqueItems.set(items.length);
      this.cartTotal.set(this.carritoService.getTotalPrice());
    });
  }

  ngOnInit(): void {
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;

    if (savedTheme) {
      // Use saved preference
      this.isDark.set(savedTheme === 'dark');
      if (this.isDark()) {
        htmlElement.classList.add('my-app-dark');
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(prefersDark);
      if (prefersDark) {
        htmlElement.classList.add('my-app-dark');
      }
    }
  }

  toggleDarkMode(): void {
    const newDarkMode = !this.isDark();
    this.isDark.set(newDarkMode);

    const htmlElement = document.documentElement;
    if (newDarkMode) {
      htmlElement.classList.add('my-app-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('my-app-dark');
      localStorage.setItem('theme', 'light');
    }
  }

}
