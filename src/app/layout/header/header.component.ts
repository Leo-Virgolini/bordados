import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menubar } from 'primeng/menubar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, Menubar, Badge, CommonModule, Avatar, InputText, InputGroup, InputGroupAddon, RouterLink, OverlayBadge],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private carritoService: CarritoService) { }

  isDark = false;

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

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
    const element = document.querySelector('html');
    if (element !== null)
      element.classList.toggle('my-app-dark');
  }

  getCarritoSize(): string {
    return this.carritoService.getCarrito()?.length?.toString() || '0';
  }

}
