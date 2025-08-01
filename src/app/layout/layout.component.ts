import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { ScrollTop } from 'primeng/scrolltop';
import { SettingsService } from '../services/settings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet, ScrollTop],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  whatsappPhone!: string;

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.settingsService.getWhatsAppPhone().subscribe(phone => {
      this.whatsappPhone = phone;
    });
  }

  getWhatsAppUrl(): string {
    // Remove any non-digit characters except + for the WhatsApp URL
    if (this.whatsappPhone) {
      const cleanPhone = this.whatsappPhone.replace(/[^\d+]/g, '');
      return `https://wa.me/${cleanPhone}`;
    }
    return '';
  }

}
