import { Injectable } from '@angular/core';
import { OrdersService } from './orders.service';
import { Observable, of, delay } from 'rxjs';
import { ChartData } from '../model/chart-data';

@Injectable({
    providedIn: 'root'
})
export class ChartsService {

    constructor(
        private ordersService: OrdersService,
    ) { }

    getSalesChartData(): Observable<any> { // Changed return type to any as SalesChartData is no longer imported
        // This would normally fetch from your backend
        // For now, we'll use mock data that matches your existing services

        const monthlySales = new ChartData({
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [{
                label: 'Ventas Mensuales',
                data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 82000, 78000, 85000],
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        });

        const dailySales = new ChartData({
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Ventas Diarias',
                data: [12000, 15000, 18000, 22000, 25000, 30000, 28000],
                borderColor: '#66BB6A',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        });

        const salesByStatus = new ChartData({
            labels: ['Pendiente', 'Confirmado', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado'],
            datasets: [{
                label: 'Pedidos por Estado',
                data: [5, 12, 8, 15, 25, 3],
                backgroundColor: [
                    '#FFA726', // Orange
                    '#42A5F5', // Blue
                    '#AB47BC', // Purple
                    '#66BB6A', // Green
                    '#26A69A', // Teal
                    '#EF5350'  // Red
                ],
                borderWidth: 1
            }]
        });

        const salesByPaymentMethod = new ChartData({
            labels: ['Efectivo', 'Tarjeta', 'Transferencia', 'MercadoPago'],
            datasets: [{
                label: 'Ventas por Método de Pago',
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#66BB6A', // Green
                    '#42A5F5', // Blue
                    '#AB47BC', // Purple
                    '#FF7043'  // Orange
                ],
                borderWidth: 1
            }]
        });

        const topProducts = new ChartData({
            labels: ['Remera Oversize Blanca', 'Buzo Capucha Gris', 'Remera Blanca Básica', 'Buzo Frisa Negro', 'Remera Negra Oversize'],
            datasets: [{
                label: 'Productos Más Vendidos',
                data: [45, 38, 32, 28, 25],
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

        const customerOrders = new ChartData({
            labels: ['1-2', '3-5', '6-10', '11-20', '20+'],
            datasets: [{
                label: 'Clientes por Cantidad de Pedidos',
                data: [25, 15, 8, 5, 2],
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

        return of({ // Changed return type to any
            monthlySales,
            dailySales,
            salesByStatus,
            salesByPaymentMethod,
            topProducts,
            customerOrders
        });
    }

    getProductAnalytics(): Observable<ChartData> {
        const productAnalytics = new ChartData({
            labels: ['Remeras', 'Buzos', 'Camisetas', 'Hoodies', 'Accesorios'],
            datasets: [{
                label: 'Stock por Categoría',
                data: [120, 85, 65, 45, 30],
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

        return of(productAnalytics);
    }

    getRevenueTrend(): Observable<ChartData> {
        const revenueTrend = new ChartData({
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [45000, 52000, 48000, 61000, 55000, 67000],
                    borderColor: '#42A5F5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Gastos',
                    data: [35000, 38000, 42000, 45000, 48000, 52000],
                    borderColor: '#EF5350',
                    backgroundColor: 'rgba(239, 83, 80, 0.1)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        });

        return of(revenueTrend);
    }

    getCustomerGrowth(): Observable<ChartData> {
        const customerGrowth = new ChartData({
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Nuevos Clientes',
                data: [12, 18, 15, 22, 25, 30],
                borderColor: '#66BB6A',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        });

        return of(customerGrowth);
    }

} 