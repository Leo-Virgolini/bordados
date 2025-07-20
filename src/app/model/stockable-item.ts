export abstract class StockableItem {

    id: string;
    name: string;
    active: boolean;

    constructor(id: string, name: string, active: boolean = true) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    get displayName(): string {
        return this.name;
    }

    get key(): string {
        return this.id;
    }

    // Abstract methods that must be implemented by subclasses
    abstract get totalStock(): number;
    abstract get isLowStock(): boolean;
    abstract get isOutOfStock(): boolean;

    // Common stock methods
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

    activate(): void {
        this.active = true;
    }

    deactivate(): void {
        this.active = false;
    }

    toggleActive(): void {
        this.active = !this.active;
    }

    validate(): boolean {
        return !!(this.id && this.name && this.active !== undefined);
    }

    equals(other: StockableItem): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.name;
    }
} 