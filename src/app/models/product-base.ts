export interface ProductSizeStock {
    size: string;
    stock: number;
}

export interface ProductVariant {
    color: string;
    sizes: ProductSizeStock[];
    image?: string; // Optional: allow different images per color
}

export abstract class ProductBase {

    id: number;
    name: string;
    description: string;
    garmentType: string;
    price: number;
    discount: number;
    type: 'bordado' | 'personalizable';
    variants: ProductVariant[];

    constructor(init?: Partial<ProductBase>) {
        this.id = init?.id || 0;
        this.name = init?.name || '';
        this.description = init?.description || '';
        this.garmentType = init?.garmentType || '';
        this.price = init?.price || 0;
        this.discount = init?.discount || 0;
        this.type = init?.type || 'bordado';
        this.variants = init?.variants || [];
    }

    get displayName(): string {
        return this.name;
    }

    get key(): number {
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