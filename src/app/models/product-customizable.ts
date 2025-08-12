import { ProductBase } from "./product-base";

export interface CustomizationData {
    threadColor1: string;
    threadColor2?: string;
    customText?: string;
    customTextColor?: string;
    customImage?: string;
}

export class ProductCustomizable extends ProductBase {

    customization?: CustomizationData;

    constructor(init?: Partial<ProductCustomizable>) {
        super(init);
        this.type = 'personalizable';
        if (init) {
            this.customization = init.customization;
        }
    }

    // Validation methods
    override validate(): boolean {
        return super.validate() && !!this.customization;
    }

}
