import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer } from '../model/customer';
import { Order, OrderItem } from '../model/order';
import { SalesSummary } from '../model/sales-summary';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private orders: Order[] = [
        new Order({
            id: 'ORD-001',
            date: new Date('2024-01-15T10:30:00'),
            customer: new Customer({
                id: 'CUST-001',
                name: 'María',
                lastName: 'González',
                email: 'maria.gonzalez@email.com',
                phone: '11 2345-6789',
                dni: '12345678',
                province: 'Buenos Aires',
                city: 'CABA',
                postalCode: '1043',
                address: 'Av. Corrientes 1234',
                floorApartment: 'Piso 3, Depto A',
                registrationDate: new Date('2024-01-10')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-001',
                    productId: '1',
                    quantity: 2,
                    unitPrice: 8500,
                    productDiscount: 1700, // Product discount per unit
                    subtotal: 13600, // (8500 * 2) - (1700 * 2) = 17000 - 3400 = 13600
                    color: 'Blanco',
                    size: 'M'
                })
            ],
            subtotal: 13600,
            couponDiscount: 0,
            shippingPrice: 1500,
            total: 15100,
            status: 'entregado',
            paymentMethod: 'mercadopago',
            notes: 'Entregar en horario de tarde',
            // Shipping address
            shippingAddress: 'Av. Corrientes 1234',
            shippingCity: 'CABA',
            shippingProvince: 'Buenos Aires',
            shippingPostalCode: '1043',
            shippingFloorApartment: 'Piso 3, Depto A'
        }),
        new Order({
            id: 'ORD-002',
            date: new Date('2024-01-20T14:15:00'),
            customer: new Customer({
                id: 'CUST-002',
                name: 'Carlos',
                lastName: 'Rodríguez',
                email: 'carlos.rodriguez@email.com',
                phone: '11 3456-7890',
                dni: '87654321',
                province: 'Buenos Aires',
                city: 'CABA',
                postalCode: '1425',
                address: 'Belgrano 567',
                floorApartment: 'Piso 1',
                registrationDate: new Date('2024-01-18')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-002',
                    productId: '2',
                    quantity: 1,
                    unitPrice: 15000,
                    productDiscount: 0,
                    subtotal: 15000,
                    color: 'Gris',
                    size: 'L'
                }),
                new OrderItem({
                    id: 'ITEM-003',
                    productId: '5',
                    quantity: 3,
                    unitPrice: 6500,
                    productDiscount: 0,
                    subtotal: 19500,
                    color: 'Blanco',
                    size: 'L'
                })
            ],
            subtotal: 34500,
            couponDiscount: 0,
            shippingPrice: 0,
            total: 34500,
            status: 'en_proceso',
            paymentMethod: 'transferencia',
            // Shipping address
            shippingAddress: 'Belgrano 567',
            shippingCity: 'CABA',
            shippingProvince: 'Buenos Aires',
            shippingPostalCode: '1425',
            shippingFloorApartment: 'Piso 1'
        }),
        new Order({
            id: 'ORD-003',
            date: new Date('2024-01-25T09:45:00'),
            customer: new Customer({
                id: 'CUST-003',
                name: 'Ana',
                lastName: 'Martínez',
                email: 'ana.martinez@email.com',
                phone: '11 4567-8901',
                dni: '23456789',
                province: 'Córdoba',
                city: 'Córdoba',
                postalCode: '5000',
                address: 'San Martín 789',
                registrationDate: new Date('2024-01-22')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-004',
                    productId: '3',
                    quantity: 1,
                    unitPrice: 18000,
                    productDiscount: 1800, // Product discount per unit
                    subtotal: 16200, // 18000 - 1800 = 16200
                    color: 'Negro',
                    size: 'M'
                })
            ],
            subtotal: 16200,
            couponDiscount: 0,
            shippingPrice: 2000,
            total: 18200,
            status: 'pendiente',
            paymentMethod: 'efectivo',
            notes: 'Envío a Córdoba',
            // Shipping address
            shippingAddress: 'San Martín 789',
            shippingCity: 'Córdoba',
            shippingProvince: 'Córdoba',
            shippingPostalCode: '5000'
        }),
        new Order({
            id: 'ORD-004',
            date: new Date('2024-01-28T16:20:00'),
            customer: new Customer({
                id: 'CUST-004',
                name: 'Luis',
                lastName: 'Fernández',
                email: 'luis.fernandez@email.com',
                phone: '11 5678-9012',
                dni: '34567890',
                province: 'Santa Fe',
                city: 'Rosario',
                postalCode: '2000',
                address: 'Pellegrini 456',
                floorApartment: 'Piso 5, Depto B',
                registrationDate: new Date('2024-01-26')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-005',
                    productId: '4',
                    quantity: 2,
                    unitPrice: 7500,
                    productDiscount: 0,
                    subtotal: 15000,
                    color: 'Negro',
                    size: 'S'
                }),
                new OrderItem({
                    id: 'ITEM-006',
                    productId: '6',
                    quantity: 1,
                    unitPrice: 12000,
                    productDiscount: 0,
                    subtotal: 12000,
                    color: 'Gris',
                    size: 'L'
                })
            ],
            subtotal: 27000,
            couponDiscount: 2700,
            shippingPrice: 2500,
            total: 26800,
            status: 'confirmado',
            paymentMethod: 'tarjeta',
            notes: 'Envío express',
            couponCode: 'DESCUENTO10',
            // Shipping address
            shippingAddress: 'Pellegrini 456',
            shippingCity: 'Rosario',
            shippingProvince: 'Santa Fe',
            shippingPostalCode: '2000',
            shippingFloorApartment: 'Piso 5, Depto B'
        }),
        new Order({
            id: 'ORD-005',
            date: new Date('2024-01-30T11:15:00'),
            customer: new Customer({
                id: 'CUST-005',
                name: 'Sofía',
                lastName: 'López',
                email: 'sofia.lopez@email.com',
                phone: '11 6789-0123',
                dni: '45678901',
                province: 'Buenos Aires',
                city: 'La Plata',
                postalCode: '1900',
                address: 'Calle 7 1234',
                registrationDate: new Date('2024-01-29')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-007',
                    productId: '1',
                    quantity: 3,
                    unitPrice: 8500,
                    productDiscount: 0,
                    subtotal: 25500,
                    color: 'Blanco',
                    size: 'L'
                }),
                new OrderItem({
                    id: 'ITEM-008',
                    productId: '3',
                    quantity: 1,
                    unitPrice: 18000,
                    productDiscount: 0,
                    subtotal: 18000,
                    color: 'Negro',
                    size: 'XL'
                })
            ],
            subtotal: 43500,
            couponDiscount: 8700,
            shippingPrice: 0,
            total: 34800,
            status: 'entregado',
            paymentMethod: 'mercadopago',
            notes: 'Cliente frecuente',
            couponCode: 'PRIMERA20',
            // Shipping address
            shippingAddress: 'Calle 7 1234',
            shippingCity: 'La Plata',
            shippingProvince: 'Buenos Aires',
            shippingPostalCode: '1900'
        }),
        new Order({
            id: 'ORD-006',
            date: new Date('2024-02-02T14:30:00'),
            customer: new Customer({
                id: 'CUST-006',
                name: 'Diego',
                lastName: 'Martínez',
                email: 'diego.martinez@email.com',
                phone: '11 7890-1234',
                dni: '56789012',
                province: 'Córdoba',
                city: 'Villa María',
                postalCode: '5900',
                address: 'San Martín 789',
                floorApartment: 'Piso 2',
                registrationDate: new Date('2024-02-01')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-009',
                    productId: '2',
                    quantity: 2,
                    unitPrice: 15000,
                    productDiscount: 0,
                    subtotal: 30000,
                    color: 'Gris',
                    size: 'M'
                }),
                new OrderItem({
                    id: 'ITEM-010',
                    productId: '5',
                    quantity: 2,
                    unitPrice: 6500,
                    productDiscount: 0,
                    subtotal: 13000,
                    color: 'Negro',
                    size: 'M'
                })
            ],
            subtotal: 43000,
            couponDiscount: 5000,
            shippingPrice: 3000,
            total: 41000,
            status: 'en_proceso',
            paymentMethod: 'transferencia',
            notes: 'Envío a Córdoba',
            couponCode: 'FIXED5000',
            // Shipping address
            shippingAddress: 'San Martín 789',
            shippingCity: 'Villa María',
            shippingProvince: 'Córdoba',
            shippingPostalCode: '5900',
            shippingFloorApartment: 'Piso 2'
        }),
        new Order({
            id: 'ORD-007',
            date: new Date('2024-02-05T09:45:00'),
            customer: new Customer({
                id: 'CUST-007',
                name: 'Valentina',
                lastName: 'García',
                email: 'valentina.garcia@email.com',
                phone: '11 8901-2345',
                dni: '67890123',
                province: 'Mendoza',
                city: 'Mendoza',
                postalCode: '5500',
                address: 'Belgrano 321',
                registrationDate: new Date('2024-02-04')
            }),
            items: [
                new OrderItem({
                    id: 'ITEM-011',
                    productId: '4',
                    quantity: 1,
                    unitPrice: 7500,
                    productDiscount: 0,
                    subtotal: 7500,
                    color: 'Negro',
                    size: 'M'
                }),
                new OrderItem({
                    id: 'ITEM-012',
                    productId: '6',
                    quantity: 1,
                    unitPrice: 12000,
                    productDiscount: 0,
                    subtotal: 12000,
                    color: 'Gris',
                    size: 'XL'
                }),
                new OrderItem({
                    id: 'ITEM-013',
                    productId: '1',
                    quantity: 1,
                    unitPrice: 8500,
                    productDiscount: 0,
                    subtotal: 8500,
                    color: 'Blanco',
                    size: 'S'
                })
            ],
            subtotal: 28000,
            couponDiscount: 4200,
            shippingPrice: 2000,
            total: 25800,
            status: 'pendiente',
            paymentMethod: 'efectivo',
            notes: 'Envío a Mendoza',
            couponCode: 'DESCUENTO15',
            // Shipping address
            shippingAddress: 'Belgrano 321',
            shippingCity: 'Mendoza',
            shippingProvince: 'Mendoza',
            shippingPostalCode: '5500'
        })
    ];

    private customers: Customer[] = [
        new Customer({
            id: 'CUST-001',
            name: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@email.com',
            phone: '11 2345-6789',
            dni: '12345678',
            province: 'Buenos Aires',
            city: 'CABA',
            postalCode: '1043',
            address: 'Av. Corrientes 1234',
            floorApartment: 'Piso 3, Depto A',
            registrationDate: new Date('2024-01-10')
        }),
        new Customer({
            id: 'CUST-002',
            name: 'Carlos',
            lastName: 'Rodríguez',
            email: 'carlos.rodriguez@email.com',
            phone: '11 3456-7890',
            dni: '87654321',
            province: 'Buenos Aires',
            city: 'CABA',
            postalCode: '1425',
            address: 'Belgrano 567',
            floorApartment: 'Piso 1',
            registrationDate: new Date('2024-01-18')
        }),
        new Customer({
            id: 'CUST-003',
            name: 'Ana',
            lastName: 'Martínez',
            email: 'ana.martinez@email.com',
            phone: '11 4567-8901',
            dni: '23456789',
            province: 'Córdoba',
            city: 'Córdoba',
            postalCode: '5000',
            address: 'San Martín 789',
            registrationDate: new Date('2024-01-22')
        }),
        new Customer({
            id: 'CUST-004',
            name: 'Luis',
            lastName: 'Fernández',
            email: 'luis.fernandez@email.com',
            phone: '11 5678-9012',
            dni: '34567890',
            province: 'Santa Fe',
            city: 'Rosario',
            postalCode: '2000',
            address: 'Pellegrini 456',
            floorApartment: 'Piso 5, Depto B',
            registrationDate: new Date('2024-01-26')
        }),
        new Customer({
            id: 'CUST-005',
            name: 'Sofía',
            lastName: 'López',
            email: 'sofia.lopez@email.com',
            phone: '11 6789-0123',
            dni: '45678901',
            province: 'Buenos Aires',
            city: 'La Plata',
            postalCode: '1900',
            address: 'Calle 7 1234',
            registrationDate: new Date('2024-01-29')
        }),
        new Customer({
            id: 'CUST-006',
            name: 'Diego',
            lastName: 'Martínez',
            email: 'diego.martinez@email.com',
            phone: '11 7890-1234',
            dni: '56789012',
            province: 'Córdoba',
            city: 'Villa María',
            postalCode: '5900',
            address: 'San Martín 789',
            floorApartment: 'Piso 2',
            registrationDate: new Date('2024-02-01')
        }),
        new Customer({
            id: 'CUST-007',
            name: 'Valentina',
            lastName: 'García',
            email: 'valentina.garcia@email.com',
            phone: '11 8901-2345',
            dni: '67890123',
            province: 'Mendoza',
            city: 'Mendoza',
            postalCode: '5500',
            address: 'Belgrano 321',
            registrationDate: new Date('2024-02-04')
        })
    ];

    getOrders(): Observable<Order[]> {
        return of(this.orders);
    }

    getOrderById(id: string): Observable<Order | undefined> {
        const order = this.orders.find(o => o.id === id);
        return of(order);
    }

    createOrder(order: Omit<Order, 'id'>): Observable<Order> {
        const newOrder = new Order({
            ...order,
            id: this.generateId()
        });
        this.orders.push(newOrder);
        return of(newOrder).pipe(delay(500));
    }

    updateOrder(order: Order): Observable<Order> {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
            this.orders[index] = new Order(order);
            return of(this.orders[index]);
        }
        throw new Error('Pedido no encontrado');
    }

    deleteOrder(id: string): Observable<void> {
        const index = this.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.orders.splice(index, 1);
            return of(void 0);
        }
        throw new Error('Pedido no encontrado');
    }

    getCustomers(): Observable<Customer[]> {
        return of(this.customers);
    }

    createCustomer(customer: Omit<Customer, 'id' | 'registrationDate'>): Observable<Customer> {
        const newCustomer = new Customer({
            ...customer,
            id: `CUST-${Date.now().toString().slice(-6)}`,
            registrationDate: new Date()
        });
        this.customers.push(newCustomer);
        return of(newCustomer);
    }

    updateCustomer(customer: Customer): Observable<Customer> {
        const index = this.customers.findIndex(c => c.id === customer.id);
        if (index !== -1) {
            this.customers[index] = new Customer(customer);
            return of(this.customers[index]);
        }
        throw new Error('Cliente no encontrado');
    }

    deleteCustomer(id: string): Observable<void> {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers.splice(index, 1);
            return of(void 0);
        }
        throw new Error('Cliente no encontrado');
    }

    getSalesSummary(): Observable<SalesSummary> {
        const totalSales = this.orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = this.orders.length;
        const newCustomers = this.customers.filter(c => {
            const daysSinceRegistration = Math.ceil((new Date().getTime() - c.registrationDate!.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceRegistration <= 30;
        }).length;
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        return of(new SalesSummary({
            monthlySales: totalSales,
            monthlyOrders: totalOrders,
            newCustomers: newCustomers,
            averageTicket: averageTicket
        }));
    }

    exportOrders(): Observable<string> {
        // Mock export functionality
        const csvContent = this.orders.map(order =>
            `${order.id},${order.date.toISOString()},${order.customer.name},${order.total}`
        ).join('\n');

        return of(csvContent);
    }

    private generateId(): string {
        const maxId = this.orders
            .map(o => Number(o.id))
            .filter(id => !isNaN(id))
            .reduce((max, id) => Math.max(max, id), 0);
        return (maxId + 1).toString();
    }

} 