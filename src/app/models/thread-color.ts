export class ThreadColor {

    id: string;
    name: string;
    active: boolean;
    code: string;
    stock: number;

    constructor(init?: Partial<ThreadColor>) {
        this.id = init?.id || '';
        this.name = init?.name || '';
        this.active = init?.active ?? true;
        this.code = init?.code || '';
        this.stock = init?.stock || 0;
    }

    // Display and key properties
    get displayName(): string {
        return this.name;
    }

    get key(): string {
        return this.id;
    }

    // Stock-related getters
    get totalStock(): number {
        return this.stock;
    }

    get isLowStock(): boolean {
        return this.stock < 50;
    }

    get isOutOfStock(): boolean {
        return this.stock === 0;
    }

    get stockStatus(): string {
        if (this.isOutOfStock) return 'Sin Stock';
        if (this.isLowStock) return 'Stock Bajo';
        return 'Stock Normal';
    }

    get stockStatusColor(): string {
        if (this.isOutOfStock) return 'danger';
        if (this.isLowStock) return 'warn';
        return 'success';
    }

    get isActive(): boolean {
        return this.active;
    }

    // Activation methods
    activate(): void {
        this.active = true;
    }

    deactivate(): void {
        this.active = false;
    }

    toggleActive(): void {
        this.active = !this.active;
    }

    // Validation methods
    validate(): boolean {
        return !!(this.id && this.name && this.active !== undefined);
    }

    isValid(): boolean {
        return !!(this.name && this.code && this.stock >= 0);
    }

    // Color-specific methods
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

    // Stock management methods
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

    // Utility methods
    equals(other: ThreadColor): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.name;
    }

} 