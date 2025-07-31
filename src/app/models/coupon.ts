export class Coupon {
    id: number;
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

    constructor(init?: Partial<Coupon>) {
        this.id = init?.id || 0;
        this.code = init?.code || '';
        this.discountType = init?.discountType || 'percentage';
        this.discountValue = init?.discountValue || 0;
        this.minOrderAmount = init?.minOrderAmount || 0;
        this.maxUses = init?.maxUses || 1;
        this.currentUses = init?.currentUses || 0;
        this.validFrom = init?.validFrom ? new Date(init.validFrom) : new Date();
        this.validTo = init?.validTo ? new Date(init.validTo) : new Date();
        this.active = init?.active ?? true;
        this.description = init?.description;
    }

    // Validation methods
    isValid(): boolean {
        return this.active && 
               this.isWithinValidDateRange() && 
               this.hasRemainingUses() &&
               this.code.trim().length > 0;
    }

    isWithinValidDateRange(): boolean {
        const now = new Date();
        return now >= this.validFrom && now <= this.validTo;
    }

    hasRemainingUses(): boolean {
        return this.currentUses < this.maxUses;
    }

    canBeAppliedToOrder(orderAmount: number): boolean {
        return this.isValid() && orderAmount >= this.minOrderAmount;
    }

    // Business logic methods
    calculateDiscount(orderAmount: number): number {
        if (!this.canBeAppliedToOrder(orderAmount)) {
            return 0;
        }

        if (this.discountType === 'percentage') {
            return Math.round(orderAmount * (this.discountValue / 100));
        } else {
            return Math.min(this.discountValue, orderAmount);
        }
    }

    getDiscountPercentage(): number {
        return this.discountType === 'percentage' ? this.discountValue : 0;
    }

    getDiscountAmount(): number {
        return this.discountType === 'fixed' ? this.discountValue : 0;
    }

    getRemainingUses(): number {
        return Math.max(0, this.maxUses - this.currentUses);
    }

    getUsagePercentage(): number {
        return this.maxUses > 0 ? (this.currentUses / this.maxUses) * 100 : 0;
    }

    // Date-related methods
    getDaysUntilExpiration(): number {
        const now = new Date();
        const diffTime = this.validTo.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysSinceCreation(): number {
        const now = new Date();
        const diffTime = now.getTime() - this.validFrom.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isExpired(): boolean {
        return new Date() > this.validTo;
    }

    isNotYetValid(): boolean {
        return new Date() < this.validFrom;
    }

    // Utility methods
    getValidationErrors(orderAmount?: number): string[] {
        const errors: string[] = [];

        if (!this.active) {
            errors.push('El cupón está inactivo');
        }

        if (!this.isWithinValidDateRange()) {
            if (this.isNotYetValid()) {
                errors.push('El cupón aún no es válido');
            } else if (this.isExpired()) {
                errors.push('El cupón ha expirado');
            }
        }

        if (!this.hasRemainingUses()) {
            errors.push('El cupón se ha agotado');
        }

        if (!this.code.trim()) {
            errors.push('El código del cupón es requerido');
        }

        if (orderAmount !== undefined && orderAmount < this.minOrderAmount) {
            errors.push(`Monto mínimo requerido: $${this.minOrderAmount.toLocaleString()}`);
        }

        return errors;
    }

    getDisplayText(): string {
        if (this.discountType === 'percentage') {
            return `${this.discountValue}% de descuento`;
        } else {
            return `$${this.discountValue.toLocaleString()} de descuento`;
        }
    }

    getFullDescription(): string {
        let desc = this.description || this.getDisplayText();
        
        if (this.minOrderAmount > 0) {
            desc += ` (mínimo $${this.minOrderAmount.toLocaleString()})`;
        }

        if (this.maxUses > 0) {
            desc += ` - ${this.getRemainingUses()} usos restantes`;
        }

        return desc;
    }

    // State management
    incrementUsage(): void {
        if (this.hasRemainingUses()) {
            this.currentUses++;
        }
    }

    deactivate(): void {
        this.active = false;
    }

    activate(): void {
        this.active = true;
    }

    // Comparison methods
    equals(other: Coupon): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.code;
    }

    // Factory methods
    static createCoupon(data: Partial<Coupon>): Coupon {
        return new Coupon(data);
    }

    static createPercentageCoupon(
        code: string,
        percentage: number,
        minOrderAmount: number = 0,
        maxUses: number = 1,
        validDays: number = 30
    ): Coupon {
        const now = new Date();
        const validTo = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
        
        return new Coupon({
            code,
            discountType: 'percentage',
            discountValue: percentage,
            minOrderAmount,
            maxUses,
            validFrom: now,
            validTo
        });
    }

    static createFixedCoupon(
        code: string,
        amount: number,
        minOrderAmount: number = 0,
        maxUses: number = 1,
        validDays: number = 30
    ): Coupon {
        const now = new Date();
        const validTo = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
        
        return new Coupon({
            code,
            discountType: 'fixed',
            discountValue: amount,
            minOrderAmount,
            maxUses,
            validFrom: now,
            validTo
        });
    }

    clone(): Coupon {
        return new Coupon(this);
    }
} 