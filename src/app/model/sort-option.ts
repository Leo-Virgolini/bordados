export class SortOption {

    constructor(
        public label: string,
        public value: string
    ) { }

    // Helper methods
    get displayName(): string {
        return this.label;
    }

    get sortKey(): string {
        return this.value;
    }

    get isAscending(): boolean {
        return this.value.includes('asc');
    }

    get isDescending(): boolean {
        return this.value.includes('desc');
    }
    
} 