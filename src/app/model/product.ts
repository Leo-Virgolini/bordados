import { ProductBase } from './product-base';

export class Product extends ProductBase {

    stock!: number;
    tags!: string[];
    category!: string;
    rating!: number;
    discount!: number;
    isNew!: boolean;
    isFeatured!: boolean;

    constructor(init?: Partial<Product>) {
        super();
        this.type = 'bordado';
        Object.assign(this, init);
    }

    get status(): string {
        if (this.isNew && this.isFeatured) return 'Nuevo y Destacado';
        if (this.isNew) return 'Nuevo';
        if (this.isFeatured) return 'Destacado';
        return 'Normal';
    }

}