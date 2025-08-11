import { ProductBase } from "./product-base";
import { ThreadColor } from "./thread-color";

export class ProductCustomizable extends ProductBase {

    threadColor1?: ThreadColor;
    threadColor2?: ThreadColor;
    customImage?: string;
    customText?: string;
    customTextColor?: ThreadColor;

    constructor(init?: Partial<ProductCustomizable>) {
        super(init);
        this.type = 'personalizable';
        if (init) {
            this.threadColor1 = init.threadColor1 as ThreadColor;
            this.threadColor2 = init.threadColor2 as ThreadColor;
            this.customImage = init.customImage;
            this.customText = init.customText;
            this.customTextColor = init.customTextColor;
        }
    }

    // Stock validation for thread colors
    get hasAvailableThreads(): boolean {
        const primaryAvailable: boolean = (this.threadColor1?.stock && this.threadColor1.stock > 0) || false;
        const secondaryAvailable: boolean = (this.threadColor2?.stock && this.threadColor2.stock > 0) || false;
        return primaryAvailable && secondaryAvailable;
    }

    get threadStockStatus(): string {
        if (!this.hasAvailableThreads) return 'Sin stock de hilos';
        if (this.threadColor1?.isLowStock || this.threadColor2?.isLowStock) return 'Stock bajo de hilos';
        return 'Stock disponible';
    }

    // Validation methods
    override validate(): boolean {
        return super.validate() && !!this.threadColor1 && !!this.customImage;
    }

}
