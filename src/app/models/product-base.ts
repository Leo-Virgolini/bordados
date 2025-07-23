import { ProductVariant } from './product-variant';

export abstract class ProductBase {

    id: string;
    name: string;
    description: string;
    garmentType: string;
    price: number;
    type: 'bordado' | 'personalizable';
    variants: ProductVariant[];

    constructor(init?: Partial<ProductBase>) {
        this.id = init?.id || '';
        this.name = init?.name || '';
        this.description = init?.description || '';
        this.garmentType = init?.garmentType || '';
        this.price = init?.price || 0;
        this.type = init?.type || 'bordado';
        this.variants = init?.variants || [];
    }

    get displayName(): string {
        return this.name;
    }

    get key(): string {
        return this.id;
    }

    getFormattedPrice(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.price);
    }

    validate(): boolean {
        return !!(this.id && this.name && this.description && this.garmentType && this.price > 0);
    }

    equals(other: ProductBase): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.name;
    }

} 