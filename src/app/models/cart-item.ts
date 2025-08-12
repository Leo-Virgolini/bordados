import { ProductEmbroided } from "./product-embroided";
import { ProductCustomizable } from "./product-customizable";
import { OrderItem } from "./order";

export class CartItem {

    id!: string;
    product!: ProductEmbroided | ProductCustomizable;
    quantity!: number;

    constructor(init?: Partial<CartItem>) {
        Object.assign(this, init);
        // Generate a unique ID only if not provided
        if (!this.id) {
            this.id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
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

    getProductImage(): string | undefined {
        return this.product.variants?.[0]?.image || 'sin_imagen.png';
    }

    getProductType(): string {
        return this.product?.type || 'standard';
    }

    // For customizable products
    getThreadColor1(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customization?.threadColor1 || '';
        }
        return '';
    }

    getThreadColor2(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customization?.threadColor2 || '';
        }
        return '';
    }

    getCustomImage(): string | undefined {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customization?.customImage;
        }
        return undefined;
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
            return (this.product as ProductCustomizable).customization?.customText || '';
        }
        return '';
    }

    getCustomTextColor(): string {
        if (this.product?.type === 'personalizable') {
            return (this.product as ProductCustomizable).customization?.customTextColor || '';
        }
        return '';
    }

    hasCustomText(): boolean {
        return this.getCustomText().length > 0;
    }

    validate(): boolean {
        return !!this.product && this.quantity > 0;
    }

    /**
     * Convert CartItem to OrderItem for order creation
     */
    toOrderItem(): OrderItem {
        return new OrderItem({
            productId: this.product.id,
            productSnapshot: {
                name: this.product.name,
                description: this.product.description || '',
                price: this.product.price,
                discount: this.hasDiscount ? this.discountAmount : 0,
                garmentType: this.product.garmentType || '',
                type: this.product.type,
                variant: {
                    color: this.getSelectedColor(),
                    size: this.getSelectedSize(),
                    image: this.getProductImage()
                }
            },
            quantity: this.quantity,
            subtotal: this.total,
            customization: this.product.type === 'personalizable' ? {
                threadColor1: this.getThreadColor1(),
                threadColor2: this.getThreadColor2(),
                customText: this.getCustomText(),
                customTextColor: this.getCustomTextColor(),
                customImage: this.getCustomImage()
            } : undefined
        });
    }

}