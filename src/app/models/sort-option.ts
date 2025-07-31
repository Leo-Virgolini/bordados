export class SortOption {

    id: string;
    name: string;

    constructor(label: string, value: string) {
        this.id = value;
        this.name = label;
    }

    get displayName(): string {
        return this.name;
    }

    get key(): string {
        return this.id;
    }

    get label(): string {
        return this.name;
    }

    get value(): string {
        return this.id;
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

    get sortDirection(): 'asc' | 'desc' {
        return this.value.includes('asc') ? 'asc' : 'desc';
    }

    get sortField(): string {
        return this.value.replace('_asc', '').replace('_desc', '');
    }

    validate(): boolean {
        return !!(this.id && this.name);
    }

    equals(other: SortOption): boolean {
        return this.id === other.id;
    }

    toString(): string {
        return this.name;
    }

} 