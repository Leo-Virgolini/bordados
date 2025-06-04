import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, Menubar, Badge, CommonModule, Avatar, InputText, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isDark = false;

  items: MenuItem[] = [
    { label: 'Inicio', icon: PrimeIcons.HOME, routerLink: '/' },
    {
      label: 'Productos', icon: PrimeIcons.BOX, routerLink: '/productos',
      items: [
        { label: 'Remeras', icon: PrimeIcons.BOX, routerLink: '/remeras' },
        { label: 'Buzos', icon: PrimeIcons.BOX, routerLink: '/buzos' }
      ]
    },
    { label: 'Contacto', icon: PrimeIcons.ENVELOPE, routerLink: '/contacto' }
  ];

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
    const element = document.querySelector('html');
    if (element !== null)
      element.classList.toggle('my-app-dark');
  }

}
