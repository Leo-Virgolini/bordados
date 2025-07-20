import { StockableItem } from './stockable-item';

export class ProductType extends StockableItem {

    description: string;
    price: number;
    sizes: string[];
    stock: { [size: string]: number };

    constructor(init?: Partial<ProductType>) {
        super(init?.id || '', init?.name || '', init?.active ?? true);
        this.description = init?.description || '';
        this.price = init?.price || 0;
        this.sizes = init?.sizes || [];
        this.stock = init?.stock || {};
    }

    get totalStock(): number {
        return Object.values(this.stock).reduce((sum, quantity) => sum + quantity, 0);
    }

    get availableSizes(): string[] {
        return this.sizes.filter(size => this.stock[size] > 0);
    }

    get isLowStock(): boolean {
        return this.totalStock < 50;
    }

    get isOutOfStock(): boolean {
        return this.totalStock === 0;
    }

    getFormattedPrice(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.price);
    }

    getStockForSize(size: string): number {
        return this.stock[size] || 0;
    }

    hasStockForSize(size: string, quantity: number = 1): boolean {
        return this.getStockForSize(size) >= quantity;
    }

    decreaseStock(size: string, quantity: number): boolean {
        if (this.hasStockForSize(size, quantity)) {
            this.stock[size] -= quantity;
            return true;
        }
        return false;
    }

    increaseStock(size: string, quantity: number): void {
        if (!this.stock[size]) {
            this.stock[size] = 0;
        }
        this.stock[size] += quantity;
    }

    addSize(size: string, initialStock: number = 0): void {
        if (!this.sizes.includes(size)) {
            this.sizes.push(size);
            this.stock[size] = initialStock;
        }
    }

    removeSize(size: string): boolean {
        const index = this.sizes.indexOf(size);
        if (index > -1) {
            this.sizes.splice(index, 1);
            delete this.stock[size];
            return true;
        }
        return false;
    }

    isValid(): boolean {
        return !!(
            this.name &&
            this.description &&
            this.price > 0 &&
            this.sizes.length > 0
        );
    }

    getLowStockSizes(): string[] {
        return this.sizes.filter(size => this.stock[size] < 10);
    }

    getOutOfStockSizes(): string[] {
        return this.sizes.filter(size => this.stock[size] === 0);
    }

} 