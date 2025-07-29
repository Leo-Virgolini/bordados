import { Injectable } from '@angular/core';
import { Observable, of, delay, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customer';
import { Order, OrderItem } from '../models/order';
import { SalesSummary } from '../models/sales-summary';
import { ProductCustomizable } from '../models/product-customizable';
import { ThreadColor } from '../models/thread-color';
import { Product } from '../models/product';
import { ProductsService } from './products.service';
import { CustomersService } from './customers.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {

    private apiUrl = 'http://localhost:3000';

    constructor(
        private http: HttpClient,
        private productsService: ProductsService,
        private customersService: CustomersService
    ) { }

    getOrders(): Observable<Order[]> {
        return this.http.get<any[]>(`${this.apiUrl}/orders`).pipe(
            map(orders => orders.map(order => ({
                ...order,
                date: new Date(order.date)
            }))),
            map(orders => orders.map(order => new Order(order)))
        );
    }

    getOrderById(id: string): Observable<Order | undefined> {
        return this.http.get<any>(`${this.apiUrl}/orders/${id}`).pipe(
            map(order => ({
                ...order,
                date: new Date(order.date)
            })),
            map(order => new Order(order))
        );
    }

    createOrder(order: Omit<Order, 'id'>): Observable<Order> {
        const newOrder = {
            ...order,
            id: this.generateId(),
            customerId: order.customerId
        };
        return this.http.post<any>(`${this.apiUrl}/orders`, newOrder).pipe(
            map(createdOrder => ({
                ...createdOrder,
                date: new Date(createdOrder.date)
            })),
            map(order => new Order(order))
        );
    }

    updateOrder(order: Order): Observable<Order> {
        const orderData = {
            ...order,
            customerId: order.customerId
        };
        return this.http.put<any>(`${this.apiUrl}/orders/${order.id}`, orderData).pipe(
            map(updatedOrder => ({
                ...updatedOrder,
                date: new Date(updatedOrder.date)
            })),
            map(order => new Order(order))
        );
    }

    deleteOrder(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
    }

    getCustomers(): Observable<Customer[]> {
        return this.customersService.getCustomers();
    }

    getSalesSummary(): Observable<SalesSummary> {
        return this.getOrders().pipe(
            map(orders => {
                const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = orders.length;

                // Get new customers count
                return this.customersService.getNewCustomerCount(30).pipe(
                    map(newCustomers => {
                        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
                        return new SalesSummary({
                            monthlySales: totalSales,
                            monthlyOrders: totalOrders,
                            newCustomers: newCustomers,
                            averageTicket: averageTicket
                        });
                    })
                );
            }),
            switchMap(summary => summary)
        );
    }

    exportOrders(): Observable<string> {
        return this.getOrders().pipe(
            map(orders => {
                const csvContent = orders.map(order =>
                    `${order.id},${order.date.toISOString()},${order.customerSnapshot.name},${order.total}`
                ).join('\n');
                return csvContent;
            })
        );
    }

    private generateId(): string {
        return `ORD-${Date.now().toString().slice(-6)}`;
    }
}