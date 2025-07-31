import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Coupon } from '../models/coupon';

@Injectable({
    providedIn: 'root'
})
export class CouponsService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getCoupons(): Observable<Coupon[]> {
        return this.http.get<any[]>(`${this.apiUrl}/coupons`).pipe(
            map(coupons => coupons.map(coupon => new Coupon(coupon)))
        );
    }

    getCouponByCode(code: string): Observable<Coupon | undefined> {
        return this.http.get<any[]>(`${this.apiUrl}/coupons?code=${code}`).pipe(
            map(coupons => coupons[0] ? new Coupon(coupons[0]) : undefined)
        );
    }

    getCouponById(id: number): Observable<Coupon | undefined> {
        return this.http.get<any>(`${this.apiUrl}/coupons/${id}`).pipe(
            map(coupon => coupon ? new Coupon(coupon) : undefined)
        );
    }

    createCoupon(coupon: Partial<Coupon>): Observable<Coupon> {
        const newCoupon = {
            ...coupon,

            validFrom: coupon.validFrom?.toISOString(),
            validTo: coupon.validTo?.toISOString()
        };
        return this.http.post<any>(`${this.apiUrl}/coupons`, newCoupon).pipe(
            map(couponData => new Coupon(couponData))
        );
    }

    updateCoupon(coupon: Coupon): Observable<Coupon> {
        const couponData = {
            ...coupon,
            validFrom: coupon.validFrom.toISOString(),
            validTo: coupon.validTo.toISOString()
        };
        return this.http.put<any>(`${this.apiUrl}/coupons/${coupon.id}`, couponData).pipe(
            map(couponData => new Coupon(couponData))
        );
    }

    deleteCoupon(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/coupons/${id}`);
    }

    validateCoupon(code: string, orderAmount: number): Observable<{ valid: boolean; coupon?: Coupon; error?: string }> {
        return this.getCouponByCode(code).pipe(
            map(coupon => {
                if (!coupon) {
                    return { valid: false, error: 'Cupón no encontrado' };
                }

                const errors = coupon.getValidationErrors(orderAmount);
                if (errors.length > 0) {
                    return { valid: false, error: errors[0] };
                }

                return { valid: true, coupon };
            }),
            catchError(() => of({ valid: false, error: 'Error al validar cupón' }))
        );
    }

    applyCouponUsage(code: string): Observable<void> {
        return this.getCouponByCode(code).pipe(
            switchMap(coupon => {
                if (coupon) {
                    coupon.incrementUsage();
                    return this.updateCoupon(coupon).pipe(
                        map(() => void 0)
                    );
                }
                throw new Error('Cupón no encontrado');
            })
        );
    }

    getActiveCoupons(): Observable<Coupon[]> {
        return this.getCoupons().pipe(
            map(coupons => coupons.filter(coupon => coupon.isValid()))
        );
    }

} 