import { StockableItem } from './stockable-item';

export class ThreadColor extends StockableItem {

    code: string;
    stock: number;

    constructor(init?: Partial<ThreadColor>) {
        super(init?.id || '', init?.name || '', init?.active ?? true);
        this.code = init?.code || '';
        this.stock = init?.stock || 0;
    }

    get totalStock(): number {
        return this.stock;
    }

    get isLowStock(): boolean {
        return this.stock < 50;
    }

    get isOutOfStock(): boolean {
        return this.stock === 0;
    }

    isValid(): boolean {
        return !!(this.name && this.code && this.stock >= 0);
    }

    isHexColor(): boolean {
        return /^#[0-9A-F]{6}$/i.test(this.code);
    }

    getRgbValues(): { r: number; g: number; b: number } | null {
        if (!this.isHexColor()) return null;

        const hex = this.code.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }

    getContrastColor(): string {
        const rgb = this.getRgbValues();
        if (!rgb) return '#000000';

        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    decreaseStock(amount: number): boolean {
        if (this.stock >= amount) {
            this.stock -= amount;
            return true;
        }
        return false;
    }

    increaseStock(amount: number): void {
        this.stock += amount;
    }
    
} 