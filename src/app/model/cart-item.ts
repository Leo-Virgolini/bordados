import { ProductBase } from "./product-base";

export class CartItem {

    product!: ProductBase;
    quantity!: number;

    constructor(init?: Partial<CartItem>) {
        Object.assign(this, init);
    }

    get total(): number {
        return this.product.price * this.quantity;
    }

    get totalFormatted(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.total);
    }

    validate(): boolean {
        return !!this.product && this.quantity > 0;
    }

} 