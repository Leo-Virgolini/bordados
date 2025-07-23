export class ChartData {

    labels: string[];

    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }[];

    constructor(init?: Partial<ChartData>) {
        this.labels = init?.labels || [];
        this.datasets = init?.datasets || [];
    }

    get totalDataPoints(): number {
        return this.labels.length;
    }

    get maxValue(): number {
        return Math.max(...this.datasets.flatMap(dataset => dataset.data));
    }

    get minValue(): number {
        return Math.min(...this.datasets.flatMap(dataset => dataset.data));
    }

    get averageValue(): number {
        const allData = this.datasets.flatMap(dataset => dataset.data);
        return allData.reduce((sum, value) => sum + value, 0) / allData.length;
    }

    getFormattedData(): string {
        return this.datasets.map(dataset =>
            `${dataset.label}: ${dataset.data.join(', ')}`
        ).join(' | ');
    }

    addDataset(label: string, data: number[], backgroundColor?: string, borderColor?: string): void {
        this.datasets.push({
            label,
            data,
            backgroundColor,
            borderColor,
            borderWidth: 2,
            fill: false
        });
    }

    removeDataset(index: number): boolean {
        if (index >= 0 && index < this.datasets.length) {
            this.datasets.splice(index, 1);
            return true;
        }
        return false;
    }

    updateLabel(index: number, newLabel: string): boolean {
        if (index >= 0 && index < this.labels.length) {
            this.labels[index] = newLabel;
            return true;
        }
        return false;
    }

    getDatasetByLabel(label: string) {
        return this.datasets.find(dataset => dataset.label === label);
    }

    sortByValue(ascending: boolean = true): void {
        const sortedIndices = this.datasets[0]?.data
            .map((value, index) => ({ value, index }))
            .sort((a, b) => ascending ? a.value - b.value : b.value - a.value)
            .map(item => item.index);

        if (sortedIndices) {
            this.labels = sortedIndices.map(index => this.labels[index]);
            this.datasets.forEach(dataset => {
                dataset.data = sortedIndices.map(index => dataset.data[index]);
            });
        }
    }

    getTopValues(count: number): { label: string; value: number }[] {
        if (!this.datasets[0]) return [];

        return this.datasets[0].data
            .map((value, index) => ({ label: this.labels[index], value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, count);
    }

    getFormattedCurrencyValues(currency: string = 'ARS'): string[] {
        return this.datasets[0]?.data.map(value =>
            new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency
            }).format(value)
        ) || [];
    }
}

export class SalesChartData {

    monthlySales: ChartData;
    dailySales: ChartData;
    salesByStatus: ChartData;
    salesByPaymentMethod: ChartData;
    topProducts: ChartData;
    customerOrders: ChartData;

    constructor(init?: Partial<SalesChartData>) {
        this.monthlySales = init?.monthlySales ? new ChartData(init.monthlySales) : new ChartData();
        this.dailySales = init?.dailySales ? new ChartData(init.dailySales) : new ChartData();
        this.salesByStatus = init?.salesByStatus ? new ChartData(init.salesByStatus) : new ChartData();
        this.salesByPaymentMethod = init?.salesByPaymentMethod ? new ChartData(init.salesByPaymentMethod) : new ChartData();
        this.topProducts = init?.topProducts ? new ChartData(init.topProducts) : new ChartData();
        this.customerOrders = init?.customerOrders ? new ChartData(init.customerOrders) : new ChartData();
    }

    get totalMonthlySales(): number {
        return this.monthlySales.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 0;
    }

    get averageDailySales(): number {
        return this.dailySales.datasets[0]?.data.reduce((sum, value) => sum + value, 0) / this.dailySales.totalDataPoints || 0;
    }

    get topSellingProduct(): { label: string; value: number } | null {
        const topProducts = this.topProducts.getTopValues(1);
        return topProducts.length > 0 ? topProducts[0] : null;
    }

    get mostPopularPaymentMethod(): { label: string; value: number } | null {
        const topMethods = this.salesByPaymentMethod.getTopValues(1);
        return topMethods.length > 0 ? topMethods[0] : null;
    }

    getFormattedTotalSales(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.totalMonthlySales);
    }

    getFormattedAverageDailySales(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.averageDailySales);
    }

    getAllChartData(): ChartData[] {
        return [
            this.monthlySales,
            this.dailySales,
            this.salesByStatus,
            this.salesByPaymentMethod,
            this.topProducts,
            this.customerOrders
        ];
    }

    getChartDataByType(type: 'monthly' | 'daily' | 'status' | 'payment' | 'products' | 'customers'): ChartData {
        switch (type) {
            case 'monthly': return this.monthlySales;
            case 'daily': return this.dailySales;
            case 'status': return this.salesByStatus;
            case 'payment': return this.salesByPaymentMethod;
            case 'products': return this.topProducts;
            case 'customers': return this.customerOrders;
            default: return this.monthlySales;
        }
    }
    
} 