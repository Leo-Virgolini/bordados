import { ProductBase } from './product-base';

export class ProductEmbroided extends ProductBase {

    tags!: string[];
    rating!: number;
    isNew!: boolean;
    isFeatured!: boolean;

    constructor(init?: Partial<ProductEmbroided>) {
        super(init);
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