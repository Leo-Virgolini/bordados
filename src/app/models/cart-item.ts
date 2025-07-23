import { ProductBase } from "./product-base";

export class CartItem {

    product!: ProductBase;
    quantity!: number;

    constructor(init?: Partial<CartItem>) {
        Object.assign(this, init);
    }

    // Get the discounted unit price
    get unitPrice(): number {
        if (this.hasDiscount) {
            return this.product.price * (1 - this.discountPercentage / 100);
        }
        return this.product.price;
    }

    // Get the original unit price
    get originalUnitPrice(): number {
        return this.product.price;
    }

    // Get the total with discount applied
    get total(): number {
        return this.unitPrice * this.quantity;
    }

    // Get the total without discount (original price)
    get originalTotal(): number {
        return this.originalUnitPrice * this.quantity;
    }

    // Get the discount amount for this item
    get discountAmount(): number {
        return this.originalTotal - this.total;
    }

    // Check if the product has a discount
    get hasDiscount(): boolean {
        return 'discount' in this.product && (this.product as any).discount > 0;
    }

    // Get discount percentage
    get discountPercentage(): number {
        return 'discount' in this.product ? (this.product as any).discount : 0;
    }

    get totalFormatted(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.total);
    }

    get unitPriceFormatted(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.unitPrice);
    }

    get originalUnitPriceFormatted(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.originalUnitPrice);
    }

    validate(): boolean {
        return !!this.product && this.quantity > 0;
    }

}