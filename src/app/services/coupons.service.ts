import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface DiscountCoupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxUses: number;
    currentUses: number;
    validFrom: Date;
    validTo: Date;
    active: boolean;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CouponsService {

    private coupons: DiscountCoupon[] = [];

    constructor() {
        this.initializeMockCoupons();
    }

    private initializeMockCoupons(): void {
        const mockCoupons: DiscountCoupon[] = [
            {
                id: 'COUPON-001',
                code: 'DESCUENTO10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 15000,
                maxUses: 50,
                currentUses: 3,
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                active: true,
                description: 'Descuento del 10% en pedidos superiores a $15,000'
            },
            {
                id: 'COUPON-002',
                code: 'PRIMERA20',
                discountType: 'percentage',
                discountValue: 20,
                minOrderAmount: 25000,
                maxUses: 25,
                currentUses: 1,
                validFrom: new Date('2024-01-15'),
                validTo: new Date('2024-06-30'),
                active: true,
                description: 'Descuento del 20% para primera compra'
            },
            {
                id: 'COUPON-003',
                code: 'FIXED5000',
                discountType: 'fixed',
                discountValue: 5000,
                minOrderAmount: 30000,
                maxUses: 30,
                currentUses: 2,
                validFrom: new Date('2024-02-01'),
                validTo: new Date('2024-08-31'),
                active: true,
                description: 'Descuento fijo de $5,000 en pedidos superiores a $30,000'
            },
            {
                id: 'COUPON-004',
                code: 'DESCUENTO15',
                discountType: 'percentage',
                discountValue: 15,
                minOrderAmount: 20000,
                maxUses: 40,
                currentUses: 1,
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-05-31'),
                active: true,
                description: 'Descuento del 15% en pedidos superiores a $20,000'
            },
            {
                id: 'COUPON-005',
                code: 'ENVIOGRATIS',
                discountType: 'fixed',
                discountValue: 2000,
                minOrderAmount: 0,
                maxUses: 100,
                currentUses: 0,
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                active: true,
                description: 'Descuento de $2,000 (equivalente a envío gratis)'
            },
            {
                id: 'COUPON-006',
                code: 'FLASH25',
                discountType: 'percentage',
                discountValue: 25,
                minOrderAmount: 40000,
                maxUses: 15,
                currentUses: 0,
                validFrom: new Date('2024-03-01'),
                validTo: new Date('2024-03-31'),
                active: true,
                description: 'Oferta flash: 25% de descuento en marzo'
            },
            {
                id: 'COUPON-007',
                code: 'FIDELIDAD',
                discountType: 'percentage',
                discountValue: 12,
                minOrderAmount: 10000,
                maxUses: 200,
                currentUses: 5,
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                active: true,
                description: 'Programa de fidelidad: 12% de descuento para clientes frecuentes'
            },
            {
                id: 'COUPON-008',
                code: 'EXPIRED',
                discountType: 'percentage',
                discountValue: 30,
                minOrderAmount: 0,
                maxUses: 10,
                currentUses: 0,
                validFrom: new Date('2023-01-01'),
                validTo: new Date('2023-12-31'),
                active: false,
                description: 'Cupón expirado (para demostración)'
            },
            {
                id: 'COUPON-009',
                code: 'EXHAUSTED',
                discountType: 'fixed',
                discountValue: 1000,
                minOrderAmount: 0,
                maxUses: 5,
                currentUses: 5,
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                active: true,
                description: 'Cupón agotado (para demostración)'
            },
            {
                id: 'COUPON-010',
                code: 'FUTURO',
                discountType: 'percentage',
                discountValue: 18,
                minOrderAmount: 35000,
                maxUses: 20,
                currentUses: 0,
                validFrom: new Date('2024-04-01'),
                validTo: new Date('2024-06-30'),
                active: true,
                description: 'Oferta de primavera: 18% de descuento'
            }
        ];

        this.coupons = mockCoupons;
    }

    // Get all coupons
    getCoupons(): Observable<DiscountCoupon[]> {
        return of([...this.coupons]);
    }

    // Get coupon by code
    getCouponByCode(code: string): Observable<DiscountCoupon | undefined> {
        const coupon = this.coupons.find(c => c.code === code.toUpperCase());
        return of(coupon);
    }

    // Get coupon by ID
    getCouponById(id: string): Observable<DiscountCoupon | undefined> {
        const coupon = this.coupons.find(c => c.id === id);
        return of(coupon);
    }

    // Create new coupon
    createCoupon(coupon: Omit<DiscountCoupon, 'id'>): Observable<DiscountCoupon> {
        const newCoupon: DiscountCoupon = {
            ...coupon,
            id: `COUPON-${Date.now().toString().slice(-6)}`,
            currentUses: 0
        };
        this.coupons.push(newCoupon);
        return of(newCoupon);
    }

    // Update existing coupon
    updateCoupon(coupon: DiscountCoupon): Observable<DiscountCoupon> {
        const index = this.coupons.findIndex(c => c.id === coupon.id);
        if (index !== -1) {
            this.coupons[index] = { ...coupon };
            return of(this.coupons[index]);
        }
        throw new Error('Cupón no encontrado');
    }

    // Delete coupon
    deleteCoupon(id: string): Observable<void> {
        const index = this.coupons.findIndex(c => c.id === id);
        if (index !== -1) {
            this.coupons.splice(index, 1);
            return of(void 0);
        }
        throw new Error('Cupón no encontrado');
    }

    // Validate and apply coupon
    validateCoupon(code: string, orderAmount: number): Observable<{ valid: boolean; coupon?: DiscountCoupon; error?: string }> {
        const coupon = this.coupons.find(c => c.code === code.toUpperCase());

        if (!coupon) {
            return of({ valid: false, error: 'Cupón no encontrado' });
        }

        if (!coupon.active) {
            return of({ valid: false, error: 'Cupón inactivo' });
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTo) {
            return of({ valid: false, error: 'Cupón fuera de fecha de validez' });
        }

        if (coupon.currentUses >= coupon.maxUses) {
            return of({ valid: false, error: 'Cupón agotado' });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return of({
                valid: false,
                error: `Monto mínimo requerido: $${coupon.minOrderAmount.toLocaleString('es-AR')}`
            });
        }

        return of({ valid: true, coupon });
    }

    // Apply coupon usage
    applyCouponUsage(code: string): Observable<void> {
        const coupon = this.coupons.find(c => c.code === code.toUpperCase());
        if (coupon && coupon.currentUses < coupon.maxUses) {
            coupon.currentUses++;
        }
        return of(void 0);
    }

    // Get active coupons
    getActiveCoupons(): Observable<DiscountCoupon[]> {
        const now = new Date();
        const activeCoupons = this.coupons.filter(c =>
            c.active &&
            now >= c.validFrom &&
            now <= c.validTo &&
            c.currentUses < c.maxUses
        );
        return of(activeCoupons);
    }

} 