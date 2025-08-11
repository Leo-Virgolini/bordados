import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Card } from 'primeng/card';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputMask } from 'primeng/inputmask';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { AppSettings, SettingsService } from '../../../../services/settings.service';



@Component({
    selector: 'app-settings-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        Button,
        InputText,
        InputNumber,
        Card,
        InputGroup,
        InputGroupAddon,
        InputMask,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './settings-tab.component.html',
    styleUrl: './settings-tab.component.scss'
})
export class SettingsTabComponent implements OnInit {

    // Settings Management
    freeShippingThreshold!: number; // Free shipping threshold
    whatsappPhone!: string; // WhatsApp number
    secondColorPrice!: number; // Second color price
    customTextPrice!: number; // Custom text price
    maxImageSize!: number; // Maximum image size in bytes
    maxTextLength!: number; // Maximum text length for custom text
    discountPercentage!: number; // Discount percentage for transfer payments

    // Social Media URLs
    facebookUrl!: string;
    instagramUrl!: string;
    tiktokUrl!: string;

    // Forms
    shippingForm!: FormGroup;
    contactForm!: FormGroup;
    socialMediaForm!: FormGroup;
    priceForm!: FormGroup;

    // Loading states
    shippingLoading: boolean = false;
    priceLoading: boolean = false;
    phoneLoading: boolean = false;
    socialMediaLoading: boolean = false;
    settingsLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.loadSettings();
    }

    private loadSettings(): void {
        this.settingsLoading = true;
        this.settingsService.getSettings().subscribe({
            next: (settings: AppSettings) => {
                this.whatsappPhone = settings.whatsAppPhone || '';
                this.freeShippingThreshold = settings.freeShippingThreshold;
                this.secondColorPrice = settings.secondColorPrice;
                this.customTextPrice = settings.customTextPrice;
                this.maxImageSize = settings.maxImageSize || 10485760; // Default 10MB
                this.maxTextLength = settings.maxTextLength || 20; // Default 20 characters
                this.discountPercentage = settings.discountPercentage || 0; // Default 0%

                // Social Media URLs
                this.facebookUrl = settings.facebookUrl || '';
                this.instagramUrl = settings.instagramUrl || '';
                this.tiktokUrl = settings.tiktokUrl || '';
                this.settingsLoading = false;
                console.log('Settings loaded:', settings);

                // Initialize forms after settings are loaded
                this.initForms();
            }, error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar la configuración: ' + error.message
                });
                this.settingsLoading = false;
            }
        });
    }

    private initForms(): void {
        // Contact settings form - strip the +54 9 prefix and formatting for the input
        if (this.whatsappPhone) {
            // Remove +54 9 prefix and any formatting (spaces, dashes)
            let phoneWithoutPrefix = this.whatsappPhone.replace('+54 9 ', '').replace(/[\s-]/g, '');
            this.contactForm = this.fb.group({
                whatsappPhone: [phoneWithoutPrefix, [Validators.required, Validators.pattern(/^\d{10}$/)]]
            });
        } else {
            this.contactForm = this.fb.group({
                whatsappPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
            });
        }

        // Shipping settings form
        this.shippingForm = this.fb.group({
            freeShippingThreshold: [this.freeShippingThreshold, [Validators.required, Validators.min(0)]]
        });

        // Social Media form
        this.socialMediaForm = this.fb.group({
            facebookUrl: [this.facebookUrl, [Validators.pattern(/^https?:\/\/.+/)]],
            instagramUrl: [this.instagramUrl, [Validators.pattern(/^https?:\/\/.+/)]],
            tiktokUrl: [this.tiktokUrl, [Validators.pattern(/^https?:\/\/.+/)]]
        });

        this.priceForm = this.fb.group({
            secondColorPrice: [this.secondColorPrice, [Validators.required, Validators.min(0)]],
            customTextPrice: [this.customTextPrice, [Validators.required, Validators.min(0)]],
            maxImageSize: [this.maxImageSize, [Validators.required, Validators.min(1024 * 1024), Validators.max(50 * 1024 * 1024)]], // 1MB to 50MB
            maxTextLength: [this.maxTextLength, [Validators.required, Validators.min(5), Validators.max(50)]], // 5 to 50 characters
            discountPercentage: [this.discountPercentage, [Validators.required, Validators.min(0), Validators.max(100)]] // 0% to 100%
        });
    }

    saveContactSettings(): void {
        if (this.contactForm.valid) {
            this.phoneLoading = true;
            const phoneWithoutPrefix = this.contactForm.get('whatsappPhone')?.value;
            // Format the phone number properly for display
            const formattedPhone = `${phoneWithoutPrefix.slice(0, 2)} ${phoneWithoutPrefix.slice(2, 6)}-${phoneWithoutPrefix.slice(6)}`;
            const phone = `+54 9 ${formattedPhone}`;

            this.settingsService.updateWhatsAppPhone(phone).subscribe({
                next: (updatedPhone) => {
                    this.whatsappPhone = updatedPhone;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Configuración guardada',
                        detail: `Número de WhatsApp actualizado: ${phone}`
                    });
                    this.phoneLoading = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al guardar la configuración: ' + error.message
                    });
                    this.phoneLoading = false;
                }
            });
        }
    }

    saveShippingSettings(): void {
        if (this.shippingForm.valid) {
            this.shippingLoading = true;
            const threshold = this.shippingForm.get('freeShippingThreshold')?.value;

            this.settingsService.updateFreeShippingThreshold(threshold).subscribe({
                next: (updatedThreshold) => {
                    this.freeShippingThreshold = updatedThreshold;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Configuración guardada',
                        detail: `Envío gratis configurado para pedidos de $${threshold.toLocaleString('es-AR')} o más`
                    });
                    this.shippingLoading = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al guardar la configuración: ' + error.message
                    });
                    this.shippingLoading = false;
                }
            });
        }
    }

    saveSocialMediaSettings(): void {
        if (this.socialMediaForm.valid) {
            this.socialMediaLoading = true;
            const facebookUrl = this.socialMediaForm.get('facebookUrl')?.value;
            const instagramUrl = this.socialMediaForm.get('instagramUrl')?.value;
            const tiktokUrl = this.socialMediaForm.get('tiktokUrl')?.value;

            // Update all social media URLs in sequence
            this.settingsService.updateFacebookUrl(facebookUrl).subscribe({
                next: (updatedFacebookUrl) => {
                    this.facebookUrl = updatedFacebookUrl;

                    this.settingsService.updateInstagramUrl(instagramUrl).subscribe({
                        next: (updatedInstagramUrl) => {
                            this.instagramUrl = updatedInstagramUrl;

                            this.settingsService.updateTikTokUrl(tiktokUrl).subscribe({
                                next: (updatedTikTokUrl) => {
                                    this.tiktokUrl = updatedTikTokUrl;
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Configuración guardada',
                                        detail: 'URLs de redes sociales actualizadas correctamente'
                                    });
                                    this.socialMediaLoading = false;
                                },
                                error: (error) => {
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Error al actualizar TikTok: ' + error.message
                                    });
                                    this.socialMediaLoading = false;
                                }
                            });
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al actualizar Instagram: ' + error.message
                            });
                            this.socialMediaLoading = false;
                        }
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar Facebook: ' + error.message
                    });
                    this.socialMediaLoading = false;
                }
            });
        }
    }



    savePrices(): void {
        if (this.priceForm.valid) {
            this.priceLoading = true;
            const secondColorPrice = this.priceForm.get('secondColorPrice')?.value;
            const customTextPrice = this.priceForm.get('customTextPrice')?.value;
            const maxImageSize = this.priceForm.get('maxImageSize')?.value;
            const maxTextLength = this.priceForm.get('maxTextLength')?.value;
            const discountPercentage = this.priceForm.get('discountPercentage')?.value;

            // Update all settings in sequence
            this.settingsService.updateSecondColorPrice(secondColorPrice).subscribe({
                next: (updatedSecondColorPrice) => {
                    this.secondColorPrice = updatedSecondColorPrice;

                    // Update custom text price
                    this.settingsService.updateCustomTextPrice(customTextPrice).subscribe({
                        next: (updatedCustomTextPrice) => {
                            this.customTextPrice = updatedCustomTextPrice;

                            // Update max image size
                            this.settingsService.updateMaxImageSize(maxImageSize).subscribe({
                                next: (updatedMaxImageSize) => {
                                    this.maxImageSize = updatedMaxImageSize;

                                    // Update max text length
                                    this.settingsService.updateMaxTextLength(maxTextLength).subscribe({
                                        next: (updatedMaxTextLength) => {
                                            this.maxTextLength = updatedMaxTextLength;
                                            this.settingsService.updateDiscountPercentage(discountPercentage).subscribe({
                                                next: (updatedDiscountPercentage) => {
                                                    this.discountPercentage = updatedDiscountPercentage;
                                                    this.messageService.add({
                                                        severity: 'success',
                                                        summary: 'Configuración actualizada',
                                                        detail: `Precios, límites y descuento actualizados correctamente`
                                                    });
                                                    this.priceLoading = false;
                                                },
                                                error: (error) => {
                                                    this.messageService.add({
                                                        severity: 'error',
                                                        summary: 'Error',
                                                        detail: 'Error al actualizar el descuento: ' + error.message
                                                    });
                                                    this.priceLoading = false;
                                                }
                                            });
                                        },
                                        error: (error) => {
                                            this.messageService.add({
                                                severity: 'error',
                                                summary: 'Error',
                                                detail: 'Error al actualizar la longitud máxima de texto: ' + error.message
                                            });
                                            this.priceLoading = false;
                                        }
                                    });
                                },
                                error: (error) => {
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Error al actualizar el tamaño máximo de imagen: ' + error.message
                                    });
                                    this.priceLoading = false;
                                }
                            });
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al actualizar el precio de texto personalizado: ' + error.message
                            });
                            this.priceLoading = false;
                        }
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el precio de segundo color: ' + error.message
                    });
                    this.priceLoading = false;
                }
            });
        }
    }

    formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

}