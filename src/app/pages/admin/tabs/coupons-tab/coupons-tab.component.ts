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
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { Message } from 'primeng/message';
import { CouponsService } from '../../../../services/coupons.service';
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
    selector: 'app-coupons-tab',
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
        Checkbox,
        DatePicker,
        Select,
        Message,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './coupons-tab.component.html',
    styleUrl: './coupons-tab.component.scss'
})
export class CouponsTabComponent implements OnInit {

    // Coupons Management
    discountCoupons: Coupon[] = [];

    // Forms
    couponForm!: FormGroup;

    // Dialog states
    showCouponDialog: boolean = false;
    editingCoupon: Coupon | null = null;
    couponLoading: boolean = false;

    // Coupon options
    discountTypes = [
        { label: 'Porcentaje (%)', value: 'percentage' },
        { label: 'Monto Fijo (ARS)', value: 'fixed' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private couponsService: CouponsService
    ) { }

    ngOnInit() {
        this.loadCoupons();
        this.initCouponForm();
    }

    private loadCoupons(): void {
        this.couponLoading = true;
        this.couponsService.getCoupons().subscribe({
            next: (coupons: Coupon[]) => {
                this.discountCoupons = coupons;
                this.couponLoading = false;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los cupones: ' + error.message
                });
                this.couponLoading = false;
            }
        });
    }

    private initCouponForm(): void {
        // Coupon form with date range validation
        this.couponForm = this.fb.group({
            id: [''],
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

    openCouponDialog(coupon?: Coupon): void {
        this.editingCoupon = coupon || null;

        if (coupon) {
            this.couponForm.patchValue({
                ...coupon,
                validFrom: new Date(coupon.validFrom),
                validTo: new Date(coupon.validTo)
            });
            // Disable ID field when editing
            this.couponForm.get('id')?.disable();
        } else {
            this.couponForm.reset({
                id: '',
                discountType: 'percentage',
                discountValue: 0,
                minOrderAmount: 0,
                maxUses: 100,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                active: true,
                description: ''
            });
            // Disable ID field for new coupons (will be generated by backend)
            this.couponForm.get('id')?.disable();
        }

        this.showCouponDialog = true;
    }

    saveCoupon(): void {
        if (this.couponForm.valid && !this.couponForm.errors?.['dateRangeInvalid']) {
            this.couponLoading = true;
            const formValue = this.couponForm.getRawValue(); // Use getRawValue to get disabled field values

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
                        this.loadCoupons(); // Reload coupons
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
                // Create new coupon - don't send ID (will be generated by backend)
                this.couponsService.createCoupon(couponData).subscribe({
                    next: (coupon) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Cupón creado',
                            detail: `El cupón ID: ${coupon.id} - "${coupon.code}" ha sido creado correctamente`
                        });
                        this.loadCoupons(); // Reload coupons
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
                this.loadCoupons(); // Reload coupons
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