import { Product } from "./product";
import { ProductCustomizable } from "./product-customizable";

export class CartItem {

    product!: Product | ProductCustomizable;
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

    // Helper methods to get product information
    getProductName(): string {
        return this.product?.name || 'Producto no disponible';
    }

    getProductImage(): string {
        if (this.product?.type === 'personalizable' && (this.product as ProductCustomizable).customImage) {
            return (this.product as ProductCustomizable).customImage;
        }
        return this.product?.variants?.[0]?.image || '';
    }

    getProductType(): string {
        return this.product?.type || 'standard';
    }

    // For customizable products
    getThreadColor1(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).threadColor1?.name || '';
        }
        return '';
    }

    getThreadColor2(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).threadColor2?.name || '';
        }
        return '';
    }

    getCustomImage(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customImage || '';
        }
        return '';
    }

    // Get selected variant color and size
    getSelectedColor(): string {
        return this.product?.variants?.[0]?.color || '';
    }

    getSelectedSize(): string {
        return this.product?.variants?.[0]?.sizes?.[0]?.size || '';
    }

    // Get custom text information
    getCustomText(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customText || '';
        }
        return '';
    }

    getCustomTextColor(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customTextColor?.name || '';
        }
        return '';
    }

    hasCustomText(): boolean {
        return this.getCustomText().length > 0;
    }

    validate(): boolean {
        return !!this.product && this.quantity > 0;
    }

}