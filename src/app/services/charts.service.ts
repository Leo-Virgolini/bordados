import { Injectable } from '@angular/core';
import { OrdersService } from './orders.service';
import { ProductsService } from './products.service';
import { CustomersService } from './customers.service';
import { Observable, of, delay, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ChartData } from '../models/chart-data';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ChartsService {

    private apiUrl = 'http://localhost:3000';

    constructor(
        private http: HttpClient,
        private ordersService: OrdersService,
        private productsService: ProductsService,
        private customersService: CustomersService
    ) { }

    getSalesChartData(): Observable<any> {
        return forkJoin({
            orders: this.http.get<any[]>(`${this.apiUrl}/orders`),
            products: this.http.get<any[]>(`${this.apiUrl}/products`),
            customers: this.http.get<any[]>(`${this.apiUrl}/customers`)
        }).pipe(
            map(({ orders, products, customers }) => {
                // Monthly Sales Data
                const monthlySales = this.generateMonthlySalesData(orders);

                // Daily Sales Data (last 7 days)
                const dailySales = this.generateDailySalesData(orders);

                // Sales by Status
                const salesByStatus = this.generateSalesByStatusData(orders);

                // Sales by Payment Method
                const salesByPaymentMethod = this.generateSalesByPaymentMethodData(orders);

                // Top Products
                const topProducts = this.generateTopProductsData(orders, products);

                // Customer Orders Distribution
                const customerOrders = this.generateCustomerOrdersData(orders, customers);

                return {
                    monthlySales,
                    dailySales,
                    salesByStatus,
                    salesByPaymentMethod,
                    topProducts,
                    customerOrders
                };
            })
        );
    }

    getProductAnalytics(): Observable<ChartData> {
        return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
            map(products => {
                const categoryData = this.aggregateProductsByCategory(products);

                return new ChartData({
                    labels: Object.keys(categoryData),
                    datasets: [{
                        label: 'Stock por Categoría',
                        data: Object.values(categoryData),
                        backgroundColor: [
                            '#42A5F5',
                            '#66BB6A',
                            '#FFA726',
                            '#AB47BC',
                            '#26A69A'
                        ],
                        borderWidth: 1
                    }]
                });
            })
        );
    }

    getRevenueTrend(): Observable<ChartData> {
        return this.http.get<any[]>(`${this.apiUrl}/orders`).pipe(
            map(orders => {
                const revenueData = this.generateRevenueTrendData(orders);

                return new ChartData({
                    labels: revenueData.labels,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: revenueData.revenue,
                            borderColor: '#42A5F5',
                            backgroundColor: 'rgba(66, 165, 245, 0.1)',
                            borderWidth: 2,
                            fill: true
                        },
                        {
                            label: 'Gastos Estimados',
                            data: revenueData.expenses,
                            borderColor: '#EF5350',
                            backgroundColor: 'rgba(239, 83, 80, 0.1)',
                            borderWidth: 2,
                            fill: true
                        }
                    ]
                });
            })
        );
    }

    getCustomerGrowth(): Observable<ChartData> {
        return this.http.get<any[]>(`${this.apiUrl}/customers`).pipe(
            map(customers => {
                const growthData = this.generateCustomerGrowthData(customers);

                return new ChartData({
                    labels: growthData.labels,
                    datasets: [{
                        label: 'Nuevos Clientes',
                        data: growthData.data,
                        borderColor: '#66BB6A',
                        backgroundColor: 'rgba(102, 187, 106, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                });
            })
        );
    }

    // Helper methods to generate chart data from API data
    private generateMonthlySalesData(orders: any[]): ChartData {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const monthlyData = new Array(12).fill(0);

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const monthIndex = orderDate.getMonth();
            monthlyData[monthIndex] += order.total || 0;
        });

        return new ChartData({
            labels: months,
            datasets: [{
                label: 'Ventas Mensuales',
                data: monthlyData,
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        });
    }

    private generateDailySalesData(orders: any[]): ChartData {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const dailyData = new Array(7).fill(0);

        // Get orders from last 7 days
        const last7Days = orders.filter(order => {
            const orderDate = new Date(order.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
        });

        last7Days.forEach(order => {
            const orderDate = new Date(order.date);
            const dayIndex = orderDate.getDay();
            dailyData[dayIndex] += order.total || 0;
        });

        return new ChartData({
            labels: days,
            datasets: [{
                label: 'Ventas Diarias',
                data: dailyData,
                borderColor: '#66BB6A',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        });
    }

    private generateSalesByStatusData(orders: any[]): ChartData {
        const statusCounts: { [key: string]: number } = {};

        orders.forEach(order => {
            const status = order.status || 'pendiente';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);

        return new ChartData({
            labels,
            datasets: [{
                label: 'Pedidos por Estado',
                data,
                backgroundColor: [
                    '#FFA726', '#42A5F5', '#AB47BC', '#66BB6A', '#26A69A', '#EF5350'
                ],
                borderWidth: 1
            }]
        });
    }

    private generateSalesByPaymentMethodData(orders: any[]): ChartData {
        const paymentCounts: { [key: string]: number } = {};

        orders.forEach(order => {
            const method = order.paymentMethod || 'efectivo';
            paymentCounts[method] = (paymentCounts[method] || 0) + 1;
        });

        const labels = Object.keys(paymentCounts);
        const data = Object.values(paymentCounts);

        return new ChartData({
            labels,
            datasets: [{
                label: 'Ventas por Método de Pago',
                data,
                backgroundColor: [
                    '#66BB6A', '#42A5F5', '#AB47BC', '#FF7043'
                ],
                borderWidth: 1
            }]
        });
    }

    private generateTopProductsData(orders: any[], products: any[]): ChartData {
        const productSales: { [key: string]: number } = {};

        orders.forEach(order => {
            if (order.items) {
                order.items.forEach((item: any) => {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        productSales[product.name] = (productSales[product.name] || 0) + (item.quantity || 1);
                    }
                });
            }
        });

        const sortedProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return new ChartData({
            labels: sortedProducts.map(([name]) => name),
            datasets: [{
                label: 'Productos Más Vendidos',
                data: sortedProducts.map(([, count]) => count),
                backgroundColor: [
                    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26A69A'
                ],
                borderWidth: 1
            }]
        });
    }

    private generateCustomerOrdersData(orders: any[], customers: any[]): ChartData {
        const customerOrderCounts: { [key: string]: number } = {};

        orders.forEach(order => {
            const customerId = order.customerId;
            customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
        });

        const orderRanges = {
            '1-2': 0,
            '3-5': 0,
            '6-10': 0,
            '11-20': 0,
            '20+': 0
        };

        Object.values(customerOrderCounts).forEach(count => {
            if (count <= 2) orderRanges['1-2']++;
            else if (count <= 5) orderRanges['3-5']++;
            else if (count <= 10) orderRanges['6-10']++;
            else if (count <= 20) orderRanges['11-20']++;
            else orderRanges['20+']++;
        });

        return new ChartData({
            labels: Object.keys(orderRanges),
            datasets: [{
                label: 'Clientes por Cantidad de Pedidos',
                data: Object.values(orderRanges),
                backgroundColor: [
                    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26A69A'
                ],
                borderWidth: 1
            }]
        });
    }

    private aggregateProductsByCategory(products: any[]): { [key: string]: number } {
        const categoryStock: { [key: string]: number } = {};

        products.forEach(product => {
            const category = product.category || 'otros';
            let totalStock = 0;

            if (product.variants) {
                product.variants.forEach((variant: any) => {
                    if (variant.sizes) {
                        variant.sizes.forEach((size: any) => {
                            totalStock += size.stock || 0;
                        });
                    }
                });
            }

            categoryStock[category] = (categoryStock[category] || 0) + totalStock;
        });

        return categoryStock;
    }

    private generateRevenueTrendData(orders: any[]): { labels: string[], revenue: number[], expenses: number[] } {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const revenue = new Array(6).fill(0);
        const expenses = new Array(6).fill(0);

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const monthIndex = orderDate.getMonth();
            if (monthIndex < 6) {
                revenue[monthIndex] += order.total || 0;
                // Estimate expenses as 70% of revenue
                expenses[monthIndex] += (order.total || 0) * 0.7;
            }
        });

        return { labels: months, revenue, expenses };
    }

    private generateCustomerGrowthData(customers: any[]): { labels: string[], data: number[] } {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const newCustomers = new Array(6).fill(0);

        customers.forEach(customer => {
            const registrationDate = new Date(customer.registrationDate);
            const monthIndex = registrationDate.getMonth();
            if (monthIndex < 6) {
                newCustomers[monthIndex]++;
            }
        });

        return { labels: months, data: newCustomers };
    }

} 