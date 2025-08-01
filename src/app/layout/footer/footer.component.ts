import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {

  // Social Media URLs
  facebookUrl: string = '';
  instagramUrl: string = '';
  tiktokUrl: string = '';

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.loadSocialMediaUrls();
  }

  private loadSocialMediaUrls(): void {
    // Load Facebook URL
    this.settingsService.getFacebookUrl().subscribe({
      next: (url) => {
        this.facebookUrl = url;
      },
      error: (error) => {
        console.error('Error loading Facebook URL:', error);
      }
    });

    // Load Instagram URL
    this.settingsService.getInstagramUrl().subscribe({
      next: (url) => {
        this.instagramUrl = url;
      },
      error: (error) => {
        console.error('Error loading Instagram URL:', error);
      }
    });

    // Load TikTok URL
    this.settingsService.getTikTokUrl().subscribe({
      next: (url) => {
        this.tiktokUrl = url;
      },
      error: (error) => {
        console.error('Error loading TikTok URL:', error);
      }
    });
  }

}
