import { ProductBase } from "./product-base";
import { ThreadColor } from "./thread-color";

export class ProductCustomizable extends ProductBase {

    threadColor1!: ThreadColor;
    threadColor2?: ThreadColor;
    customImage!: string;

    constructor(init?: Partial<ProductCustomizable>) {
        super(init);
        this.type = 'personalizable';
        Object.assign(this, init);
    }

    // Helper methods for thread color management
    get primaryColor(): string {
        return this.threadColor1?.code || '#000000';
    }

    get secondaryColor(): string {
        return this.threadColor2?.code || this.primaryColor;
    }

    get primaryColorName(): string {
        return this.threadColor1?.name || 'Sin color';
    }

    get secondaryColorName(): string {
        return this.threadColor2?.name || this.primaryColorName;
    }

    get hasTwoColors(): boolean {
        return !!this.threadColor2;
    }

    get colorCombination(): string {
        if (this.hasTwoColors) {
            return `${this.primaryColorName} y ${this.secondaryColorName}`;
        }
        return this.primaryColorName;
    }

    // Stock validation for thread colors
    get hasAvailableThreads(): boolean {
        const primaryAvailable = this.threadColor1?.stock > 0;
        const secondaryAvailable = !this.threadColor2 || this.threadColor2.stock > 0;
        return primaryAvailable && secondaryAvailable;
    }

    get threadStockStatus(): string {
        if (!this.hasAvailableThreads) return 'Sin stock de hilos';
        if (this.threadColor1?.isLowStock || this.threadColor2?.isLowStock) return 'Stock bajo de hilos';
        return 'Stock disponible';
    }

    // Calculate additional cost based on thread colors
    get threadCost(): number {
        let cost = 0;
        if (this.threadColor1) cost += 500; // Base cost for primary color
        if (this.threadColor2) cost += 300; // Additional cost for secondary color
        return cost;
    }

    get totalPriceWithThreads(): number {
        return this.price + this.threadCost;
    }

    getFormattedThreadCost(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.threadCost);
    }

    getFormattedTotalPriceWithThreads(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.totalPriceWithThreads);
    }

    // Validation methods
    override validate(): boolean {
        return super.validate() && !!this.threadColor1 && !!this.customImage;
    }

    validateThreadColors(): boolean {
        return !!this.threadColor1 && this.threadColor1.isValid();
    }

    // Thread color management methods
    setPrimaryColor(threadColor: ThreadColor): void {
        this.threadColor1 = threadColor;
    }

    setSecondaryColor(threadColor: ThreadColor): void {
        this.threadColor2 = threadColor;
    }

    removeSecondaryColor(): void {
        this.threadColor2 = undefined;
    }

    // Check if thread colors are compatible (for business logic)
    areColorsCompatible(): boolean {
        if (!this.threadColor1 || !this.threadColor2) return true;

        // Business rule: certain color combinations might not be allowed
        const incompatiblePairs = [
            ['#FF0000', '#00FF00'], // Red and Green
            ['#0000FF', '#FFFF00'], // Blue and Yellow
            ['#FF00FF', '#00FFFF']  // Magenta and Cyan
        ];

        const color1 = this.threadColor1.code.toUpperCase();
        const color2 = this.threadColor2.code.toUpperCase();

        return !incompatiblePairs.some(pair =>
            (pair[0] === color1 && pair[1] === color2) ||
            (pair[0] === color2 && pair[1] === color1)
        );
    }

    // Generate a preview description
    getThreadColorDescription(): string {
        if (this.hasTwoColors) {
            return `Bordado en ${this.primaryColorName} y ${this.secondaryColorName}`;
        }
        return `Bordado en ${this.primaryColorName}`;
    }

}
