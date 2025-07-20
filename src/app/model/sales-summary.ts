export class SalesSummary {

    monthlySales: number;
    monthlyOrders: number;
    newCustomers: number;
    averageTicket: number;

    constructor(init?: Partial<SalesSummary>) {
        this.monthlySales = init?.monthlySales || 0;
        this.monthlyOrders = init?.monthlyOrders || 0;
        this.newCustomers = init?.newCustomers || 0;
        this.averageTicket = init?.averageTicket || 0;
    }

    getFormattedMonthlySales(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.monthlySales);
    }

    getFormattedAverageTicket(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.averageTicket);
    }

    getGrowthPercentage(previousMonthSales: number): number {
        if (previousMonthSales === 0) return 0;
        return ((this.monthlySales - previousMonthSales) / previousMonthSales) * 100;
    }

    getCustomerAcquisitionRate(): number {
        return this.monthlyOrders > 0 ? (this.newCustomers / this.monthlyOrders) * 100 : 0;
    }

    isAboveTarget(targetSales: number): boolean {
        return this.monthlySales >= targetSales;
    }
} 