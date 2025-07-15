export class Category {
    constructor(
        public label: string,
        public value: string
    ) { }

    // Helper methods
    get displayName(): string {
        return this.label;
    }

    get key(): string {
        return this.value;
    }
} 