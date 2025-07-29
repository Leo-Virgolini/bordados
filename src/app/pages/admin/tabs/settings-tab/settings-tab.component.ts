import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputMask } from 'primeng/inputmask';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { Message } from 'primeng/message';
import { CouponsService } from '../../../../services/coupons.service';
import { SettingsService } from '../../../../services/settings.service';
import { Coupon } from '../../../../models/coupon';

// Custom validator for date range
function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const validFrom = control.get('validFrom')?.value;
    const validTo = control.get('validTo')?.value;

    if (validFrom && validTo) {
        const fromDate = new Date(validFrom);
        const toDate = new Date(validTo);

        // Reset time to compare only dates
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        if (fromDate > toDate) {
            return { dateRangeInvalid: true };
        }
    }

    return null;
}

@Component({
    selector: 'app-settings-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Dialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        InputMask,
        Checkbox,
        DatePicker,
        Select,
        Message,
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
    discountCoupons: Coupon[] = [];

    // Forms
    shippingForm!: FormGroup;
    contactForm!: FormGroup;
    couponForm!: FormGroup;

    // Dialog states
    showCouponDialog: boolean = false;
    editingCoupon: Coupon | null = null;
    couponLoading: boolean = false;
    shippingLoading: boolean = false;
    contactLoading: boolean = false;

    // Coupon options
    discountTypes = [
        { label: 'Porcentaje (%)', value: 'percentage' },
        { label: 'Monto Fijo (ARS)', value: 'fixed' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private couponsService: CouponsService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.loadSettings();
        this.initForms();
    }

    private loadSettings(): void {
        this.settingsService.getFreeShippingThreshold().subscribe(threshold => {
            this.freeShippingThreshold = threshold;
        });

        this.settingsService.getWhatsAppPhone().subscribe(phone => {
            this.whatsappPhone = phone;
        });

        this.couponsService.getCoupons().subscribe(coupons => {
            this.discountCoupons = coupons;
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

        // Coupon form with date range validation
        this.couponForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            discountType: ['percentage', Validators.required],
            discountValue: [0, [Validators.required, Validators.min(0)]],
            minOrderAmount: [0, [Validators.min(0)]],
            maxUses: [100, [Validators.required, Validators.min(0)]],
            validFrom: [new Date(), Validators.required],
            validTo: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required], // 30 days from now
            active: [true],
            description: ['']
        }, { validators: dateRangeValidator });

        // Listen for date changes to trigger validation
        this.couponForm.get('validFrom')?.valueChanges.subscribe(() => {
            this.couponForm.updateValueAndValidity();
        });

        this.couponForm.get('validTo')?.valueChanges.subscribe(() => {
            this.couponForm.updateValueAndValidity();
        });
    }

    saveContactSettings(): void {
        if (this.contactForm.valid) {
            this.contactLoading = true;
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
                    this.contactLoading = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al guardar la configuración: ' + error.message
                    });
                    this.contactLoading = false;
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

    openCouponDialog(coupon?: Coupon): void {
        this.editingCoupon = coupon || null;

        if (coupon) {
            this.couponForm.patchValue({
                ...coupon,
                validFrom: new Date(coupon.validFrom),
                validTo: new Date(coupon.validTo)
            });
        } else {
            this.couponForm.reset({
                discountType: 'percentage',
                discountValue: 0,
                minOrderAmount: 0,
                maxUses: 100,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                active: true,
                description: ''
            });
        }

        this.showCouponDialog = true;
    }

    saveCoupon(): void {
        if (this.couponForm.valid && !this.couponForm.errors?.['dateRangeInvalid']) {
            this.couponLoading = true;
            const formValue = this.couponForm.value;

            // Validate discount value based on type
            if (formValue.discountType === 'percentage' && formValue.discountValue > 100) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'El descuento porcentual no puede ser mayor al 100%'
                });
                this.couponLoading = false;
                return;
            }

            const couponData = {
                code: formValue.code.toUpperCase(),
                discountType: formValue.discountType,
                discountValue: formValue.discountValue,
                minOrderAmount: formValue.minOrderAmount || 0,
                maxUses: formValue.maxUses,
                currentUses: this.editingCoupon?.currentUses || 0,
                validFrom: formValue.validFrom,
                validTo: formValue.validTo,
                active: formValue.active,
                description: formValue.description
            };

            if (this.editingCoupon) {
                // Update existing coupon
                const updatedCoupon = new Coupon({
                    ...this.editingCoupon,
                    ...couponData
                });

                this.couponsService.updateCoupon(updatedCoupon).subscribe({
                    next: (coupon) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Cupón actualizado',
                            detail: `El cupón ID: ${coupon.id} - ${coupon.code} ha sido actualizado correctamente`
                        });
                        this.loadSettings(); // Reload coupons
                        this.showCouponDialog = false;
                        this.editingCoupon = null;
                        this.couponLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al actualizar el cupón'
                        });
                        this.couponLoading = false;
                    }
                });
            } else {
                // Create new coupon
                this.couponsService.createCoupon(couponData).subscribe({
                    next: (coupon) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Cupón creado',
                            detail: `El cupón "${coupon.code}" ha sido creado correctamente`
                        });
                        this.loadSettings(); // Reload coupons
                        this.showCouponDialog = false;
                        this.editingCoupon = null;
                        this.couponLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al crear el cupón'
                        });
                        this.couponLoading = false;
                    }
                });
            }
        }
    }

    confirmDeleteCoupon(coupon: Coupon): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el cupón ID: ${coupon.id} - ${coupon.code}? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteCoupon(coupon);
            }
        });
    }

    deleteCoupon(coupon: Coupon): void {
        this.couponsService.deleteCoupon(coupon.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Cupón eliminado',
                    detail: `El cupón ID: ${coupon.id} - ${coupon.code} ha sido eliminado correctamente`
                });
                this.loadSettings(); // Reload coupons
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al eliminar el cupón'
                });
            }
        });
    }

    getCouponStatus(coupon: Coupon): { severity: string; value: string } {
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validTo = new Date(coupon.validTo);

        if (!coupon.active) {
            return { severity: 'danger', value: 'Inactivo' };
        }

        if (now < validFrom) {
            return { severity: 'warn', value: 'Pendiente' };
        }

        if (now > validTo) {
            return { severity: 'danger', value: 'Expirado' };
        }

        if (coupon.currentUses >= coupon.maxUses) {
            return { severity: 'danger', value: 'Agotado' };
        }

        return { severity: 'success', value: 'Activo' };
    }

    getDiscountDisplay(coupon: Coupon): string {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`;
        } else {
            return `$${coupon.discountValue.toLocaleString('es-AR')}`;
        }
    }

    getUsageDisplay(coupon: Coupon): string {
        return `${coupon.currentUses}/${coupon.maxUses}`;
    }

    isCouponExpired(coupon: Coupon): boolean {
        const now = new Date();
        const validTo = new Date(coupon.validTo);
        return now > validTo;
    }

    isCouponExhausted(coupon: Coupon): boolean {
        return coupon.currentUses >= coupon.maxUses;
    }

    hasDateRangeError(): boolean {
        return this.couponForm.errors?.['dateRangeInvalid'] === true;
    }

    isFormValid(): boolean {
        return this.couponForm.valid && !this.hasDateRangeError();
    }

}