import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputMask } from 'primeng/inputmask';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { OrdersService } from '../../../../services/orders.service';
import { Order, OrderItem } from '../../../../model/order';
import { Customer } from '../../../../model/customer';
import { SalesSummary } from '../../../../model/sales-summary';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../model/product';
import { CouponsService, DiscountCoupon } from '../../../../services/coupons.service';

@Component({
    selector: 'app-sales-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        TabsModule,
        Button,
        InputText,
        InputNumber,
        Select,
        Dialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        InputMask,
        Textarea,
        DatePickerModule,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './sales-tab.component.html',
    styleUrl: './sales-tab.component.scss'
})
export class SalesTabComponent implements OnInit {

    // Sales Management
    orders: Order[] = [];
    customers: Customer[] = [];
    products: Product[] = [];
    salesSummary: SalesSummary = new SalesSummary({
        monthlySales: 0,
        monthlyOrders: 0,
        newCustomers: 0,
        averageTicket: 0
    });
    ordersLoading: boolean = false;
    customersLoading: boolean = false;

    // Customer Dialog
    showCustomerDialog: boolean = false;
    editingCustomer: Customer | null = null;
    customerForm!: FormGroup;
    customerLoading: boolean = false;

    // Order Dialog
    showOrderDialog: boolean = false;
    editingOrder: Order | null = null;
    orderForm!: FormGroup;
    orderLoading: boolean = false;

    // Coupon Management
    availableCoupons: DiscountCoupon[] = [];
    selectedCoupon: DiscountCoupon | null = null;
    couponLoading: boolean = false;

    // Customer Details Dialog
    showCustomerDetailsDialog: boolean = false;
    selectedCustomer: Customer | null = null;

    // Order Details Dialog
    showOrderDetailsDialog: boolean = false;
    selectedOrder: Order | null = null;

    // Tab Management
    activeTabIndex: number = 0;

    // Provinces for Argentina
    provinces = [
        { label: 'Buenos Aires', value: 'Buenos Aires' },
        { label: 'CABA', value: 'CABA' },
        { label: 'Catamarca', value: 'Catamarca' },
        { label: 'Chaco', value: 'Chaco' },
        { label: 'Chubut', value: 'Chubut' },
        { label: 'Córdoba', value: 'Córdoba' },
        { label: 'Corrientes', value: 'Corrientes' },
        { label: 'Entre Ríos', value: 'Entre Ríos' },
        { label: 'Formosa', value: 'Formosa' },
        { label: 'Jujuy', value: 'Jujuy' },
        { label: 'La Pampa', value: 'La Pampa' },
        { label: 'La Rioja', value: 'La Rioja' },
        { label: 'Mendoza', value: 'Mendoza' },
        { label: 'Misiones', value: 'Misiones' },
        { label: 'Neuquén', value: 'Neuquén' },
        { label: 'Río Negro', value: 'Río Negro' },
        { label: 'Salta', value: 'Salta' },
        { label: 'San Juan', value: 'San Juan' },
        { label: 'San Luis', value: 'San Luis' },
        { label: 'Santa Cruz', value: 'Santa Cruz' },
        { label: 'Santa Fe', value: 'Santa Fe' },
        { label: 'Santiago del Estero', value: 'Santiago del Estero' },
        { label: 'Tierra del Fuego', value: 'Tierra del Fuego' },
        { label: 'Tucumán', value: 'Tucumán' }
    ];

    // Order status options
    orderStatusOptions = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Confirmado', value: 'confirmado' },
        { label: 'En Proceso', value: 'en_proceso' },
        { label: 'Enviado', value: 'enviado' },
        { label: 'Entregado', value: 'entregado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    // Payment method options
    paymentMethodOptions = [
        { label: 'Efectivo', value: 'efectivo' },
        { label: 'Tarjeta', value: 'tarjeta' },
        { label: 'Transferencia', value: 'transferencia' },
        { label: 'MercadoPago', value: 'mercadopago' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private ordersService: OrdersService,
        private productsService: ProductsService,
        private couponsService: CouponsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadSalesData();
        this.loadProducts();
        this.loadCoupons();
        this.initForms();
    }

    private initForms(): void {
        // Customer Form
        this.customerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(10)]],
            dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]],
            province: ['', Validators.required],
            city: ['', [Validators.required, Validators.minLength(2)]],
            postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(5)]],
            address: ['', [Validators.required, Validators.minLength(5)]],
            floorApartment: ['']
        });

        // Order Form
        this.orderForm = this.fb.group({
            id: ['', Validators.required],
            date: [new Date(), Validators.required],
            customerId: ['', Validators.required],
            items: this.fb.array([]),
            couponCode: [''],
            subtotal: [0, [Validators.required, Validators.min(0)]],
            couponDiscount: [0, [Validators.min(0)]],
            shippingPrice: [0, [Validators.min(0)]],
            total: [0, [Validators.required, Validators.min(0)]],
            status: ['pendiente', Validators.required],
            paymentMethod: ['efectivo', Validators.required],
            notes: [''],
            // Shipping address fields
            shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
            shippingCity: ['', [Validators.required, Validators.minLength(2)]],
            shippingProvince: ['', Validators.required],
            shippingPostalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(5)]],
            shippingFloorApartment: ['']
        });
    }

    private loadSalesData(): void {
        this.ordersLoading = true;
        this.customersLoading = true;

        // Load orders
        this.ordersService.getOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.ordersLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los pedidos: ' + error.message
                });
                this.ordersLoading = false;
            }
        });

        // Load customers
        this.ordersService.getCustomers().subscribe({
            next: (customers) => {
                this.customers = customers;
                this.customersLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los clientes: ' + error.message
                });
                this.customersLoading = false;
            }
        });

        // Load sales summary
        this.ordersService.getSalesSummary().subscribe({
            next: (summary) => {
                this.salesSummary = summary;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar el resumen de ventas: ' + error.message
                });
            }
        });
    }

    private loadProducts(): void {
        this.productsService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos: ' + error.message
                });
            }
        });
    }

    private loadCoupons(): void {
        // Load active coupons from service
        this.couponsService.getActiveCoupons().subscribe({
            next: (coupons) => {
                this.availableCoupons = coupons;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los cupones: ' + error.message
                });
            }
        });
    }

    // Getters for sales summary
    get monthlySales(): number {
        return this.salesSummary.monthlySales;
    }

    get monthlyOrders(): number {
        return this.salesSummary.monthlyOrders;
    }

    get newCustomers(): number {
        return this.salesSummary.newCustomers;
    }

    get averageTicket(): number {
        return this.salesSummary.averageTicket;
    }

    // Get customers with fullName for dropdown
    get customersWithFullName() {
        return this.customers.map(customer => ({
            ...customer,
            fullName: `${customer.name} ${customer.lastName}`
        }));
    }

    // Order status helpers
    getOrderStatusLabel(estado: string): string {
        const statusMap: { [key: string]: string } = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_proceso': 'En Proceso',
            'enviado': 'Enviado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return statusMap[estado] || estado;
    }

    getOrderStatusSeverity(estado: string): string {
        const severityMap: { [key: string]: string } = {
            'pendiente': 'warn',
            'confirmado': 'info',
            'en_proceso': 'primary',
            'enviado': 'success',
            'entregado': 'success',
            'cancelado': 'danger'
        };
        return severityMap[estado] || 'secondary';
    }

    getPaymentMethodLabel(metodo: string): string {
        const methodMap: { [key: string]: string } = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta',
            'transferencia': 'Transferencia',
            'mercadopago': 'MercadoPago'
        };
        return methodMap[metodo] || metodo;
    }

    // Customer Management Methods
    getCustomerOrderCount(customerId: string): number {
        return this.orders.filter(order => order.customer.id === customerId).length;
    }

    getCustomerTotalSpent(customerId: string): number {
        return this.orders
            .filter(order => order.customer.id === customerId)
            .reduce((total, order) => total + order.total, 0);
    }

    openCustomerDialog(customer?: Customer): void {
        this.editingCustomer = customer || null;
        if (customer) {
            this.customerForm.patchValue(customer);
        } else {
            this.customerForm.reset();
        }
        this.showCustomerDialog = true;
    }

    saveCustomer(): void {
        if (this.customerForm.valid) {
            this.customerLoading = true;
            const formValue = this.customerForm.value;

            if (this.editingCustomer) {
                // Update existing customer
                const updatedCustomer = { ...this.editingCustomer, ...formValue };
                this.ordersService.updateCustomer(updatedCustomer).subscribe({
                    next: (customer) => {
                        const index = this.customers.findIndex(c => c.id === customer.id);
                        if (index !== -1) {
                            this.customers[index] = customer;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: 'Cliente actualizado correctamente'
                        });
                        this.showCustomerDialog = false;
                        this.editingCustomer = null;
                        this.customerLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el cliente: ' + error.message
                        });
                        this.customerLoading = false;
                    }
                });
            } else {
                // Create new customer
                this.ordersService.createCustomer(formValue).subscribe({
                    next: (newCustomer) => {
                        this.customers.push(newCustomer);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: 'Cliente creado correctamente'
                        });
                        this.showCustomerDialog = false;
                        this.editingCustomer = null;
                        this.customerLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el cliente: ' + error.message
                        });
                        this.customerLoading = false;
                    }
                });
            }
        }
    }

    viewCustomer(customer: Customer): void {
        this.selectedCustomer = customer;
        this.showCustomerDetailsDialog = true;
    }

    editCustomer(customer: Customer): void {
        this.openCustomerDialog(customer);
    }

    confirmDeleteCustomer(customer: Customer): void {
        const orderCount = this.getCustomerOrderCount(customer.id);
        const message = orderCount > 0
            ? `¿Estás seguro de eliminar al cliente ID: ${customer.id} - ${customer.name} ${customer.lastName}? Tiene ${orderCount} pedido/s asociado/s.`
            : `¿Estás seguro de eliminar al cliente ID: ${customer.id} - ${customer.name} ${customer.lastName}?`;

        this.confirmationService.confirm({
            message: message,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteCustomer(customer);
            }
        });
    }

    deleteCustomer(customer: Customer): void {
        this.ordersService.deleteCustomer(customer.id).subscribe({
            next: () => {
                this.customers = this.customers.filter(c => c.id !== customer.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente eliminado',
                    detail: `El cliente ID: ${customer.id} - ${customer.name} ${customer.lastName} ha sido eliminado correctamente`
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el cliente: ' + error.message
                });
            }
        });
    }

    exportCustomers(): void {
        // Create CSV content for customers
        const csvContent = this.customers.map(customer =>
            `${customer.id},${customer.name} ${customer.lastName},${customer.email},${customer.phone},${customer.dni},${customer.province},${customer.city},${customer.postalCode},${customer.address},${customer.floorApartment || ''},${this.getCustomerOrderCount(customer.id)},${this.getCustomerTotalSpent(customer.id)}`
        ).join('\n');

        // Add header
        const header = 'ID,Nombre,Email,Teléfono,DNI,Provincia,Localidad,Código Postal,Dirección,Piso/Depto,Pedidos,Total Gastado\n';
        const fullContent = header + csvContent;

        // Create and download CSV file
        const blob = new Blob([fullContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
            severity: 'success',
            summary: 'Exportación exitosa',
            detail: 'Los clientes han sido exportados correctamente'
        });
    }

    // Order Management Methods
    get orderItemsArray() {
        return this.orderForm.get('items') as FormArray;
    }

    openOrderDialog(order?: Order): void {
        this.editingOrder = order || null;

        // Reset form first with correct field names
        this.orderForm.reset({
            id: order ? order.id : `ORD-${Date.now()}`,
            date: new Date(),
            status: 'pendiente',
            paymentMethod: 'efectivo',
            subtotal: 0,
            couponDiscount: 0,
            shippingPrice: 0,
            total: 0,
            customerId: '',
            couponCode: '',
            notes: '',
            // Shipping address defaults
            shippingAddress: '',
            shippingCity: '',
            shippingProvince: '',
            shippingPostalCode: '',
            shippingFloorApartment: ''
        });

        // Clear items array
        while (this.orderItemsArray.length !== 0) {
            this.orderItemsArray.removeAt(0);
        }

        if (order) {
            // Prepare order data for form
            const orderData = {
                id: order.id,
                date: order.date,
                customerId: order.customer.id,
                couponCode: order.couponCode || '',
                subtotal: order.subtotal,
                couponDiscount: order.couponDiscount,
                shippingPrice: order.shippingPrice || 0,
                total: order.total,
                status: order.status,
                paymentMethod: order.paymentMethod,
                notes: order.notes || '',
                // Shipping address from order
                shippingAddress: order.shippingAddress,
                shippingCity: order.shippingCity,
                shippingProvince: order.shippingProvince,
                shippingPostalCode: order.shippingPostalCode,
                shippingFloorApartment: order.shippingFloorApartment || ''
            };

            // Set form values
            this.orderForm.patchValue(orderData);

            // If there's a coupon code, find and set the selected coupon
            if (order.couponCode) {
                this.couponsService.getCouponByCode(order.couponCode).subscribe(coupon => {
                    if (coupon) {
                        this.selectedCoupon = coupon;
                    }
                });
            }

            // Prepare items data for form array
            const itemsData = order.items.map(item => ({
                productId: item.productId,
                color: item.color || '',
                size: item.size || '',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productDiscount: item.productDiscount || 0
            }));

            // Create form groups for each item and add them to the array
            itemsData.forEach(itemData => {
                const itemGroup = this.fb.group({
                    productId: [itemData.productId, Validators.required],
                    color: [itemData.color],
                    size: [itemData.size],
                    quantity: [itemData.quantity, [Validators.required, Validators.min(1)]],
                    unitPrice: [itemData.unitPrice, [Validators.required, Validators.min(0)]],
                    productDiscount: [itemData.productDiscount, [Validators.min(0)]]
                });
                this.orderItemsArray.push(itemGroup);
            });
        } else {
            // Add at least one empty item for new orders
            this.addOrderItem();
        }

        // Force form update to ensure p-select components are properly bound
        this.orderForm.updateValueAndValidity();
        this.orderItemsArray.updateValueAndValidity();

        // Ensure dialog opens immediately
        this.showOrderDialog = true;
    }

    addOrderItem(): void {
        this.orderItemsArray.push(this.fb.group({
            productId: ['', Validators.required],
            color: [''],
            size: [''],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            productDiscount: [0, [Validators.min(0)]]
        }));
    }

    removeOrderItem(index: number): void {
        this.orderItemsArray.removeAt(index);
        this.calculateOrderTotals();
    }

    calculateOrderTotals(): void {
        const items = this.orderItemsArray.value;
        let subtotal = 0;

        items.forEach((item: any) => {
            if (item.quantity && item.unitPrice) {
                const grossSubtotal = item.quantity * item.unitPrice;
                const totalProductDiscount = (item.productDiscount || 0) * item.quantity;
                subtotal += Math.max(0, grossSubtotal - totalProductDiscount);
            }
        });

        const couponDiscount = this.orderForm.get('couponDiscount')?.value || 0;
        const shippingPrice = this.orderForm.get('shippingPrice')?.value || 0;
        const total = Math.max(0, subtotal - couponDiscount + shippingPrice);

        this.orderForm.patchValue({
            subtotal: subtotal,
            total: total
        });
    }

    onItemChange(): void {
        this.calculateOrderTotals();
    }

    onProductChange(itemIndex: number): void {
        const itemGroup = this.orderItemsArray.at(itemIndex);
        const productId = itemGroup.get('productId')?.value;
        const selectedProduct = this.products.find(p => p.id === productId);

        if (selectedProduct) {
            itemGroup.patchValue({
                unitPrice: selectedProduct.price
            });
        }

        this.calculateOrderTotals();
    }

    onCustomerChange(): void {
        const customerId = this.orderForm.get('customerId')?.value;
        const selectedCustomer = this.customers.find(c => c.id === customerId);

        if (selectedCustomer) {
            // Auto-fill shipping address with customer's address
            this.orderForm.patchValue({
                shippingAddress: selectedCustomer.address,
                shippingCity: selectedCustomer.city,
                shippingProvince: selectedCustomer.province,
                shippingPostalCode: selectedCustomer.postalCode,
                shippingFloorApartment: selectedCustomer.floorApartment || ''
            });
        }
    }

    getCurrentTaxAmount(): number {
        const subtotal = this.orderForm.get('subtotal')?.value || 0;
        const discount = this.orderForm.get('discount')?.value || 0;
        return (subtotal - discount) * 0.21;
    }

    validateAndApplyCoupon(): void {
        const couponCode = this.orderForm.get('couponCode')?.value;
        if (!couponCode) {
            this.selectedCoupon = null;
            this.calculateOrderTotals();
            return;
        }

        this.couponLoading = true;
        const subtotal = this.orderForm.get('subtotal')?.value || 0;

        // Validate coupon using service
        this.couponsService.validateCoupon(couponCode, subtotal).subscribe({
            next: (result) => {
                if (result.valid && result.coupon) {
                    // Apply coupon
                    this.selectedCoupon = result.coupon;
                    let discountAmount = 0;

                    if (result.coupon.discountType === 'percentage') {
                        discountAmount = subtotal * (result.coupon.discountValue / 100);
                    } else {
                        discountAmount = result.coupon.discountValue;
                    }

                    // Ensure discount doesn't exceed subtotal
                    discountAmount = Math.min(discountAmount, subtotal);

                    this.orderForm.get('couponDiscount')?.setValue(discountAmount);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Cupón aplicado',
                        detail: `Descuento de ${result.coupon.discountType === 'percentage' ? result.coupon.discountValue + '%' : '$' + result.coupon.discountValue.toLocaleString('es-AR')} aplicado`
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Cupón inválido',
                        detail: result.error || 'El código de cupón no es válido'
                    });
                    this.selectedCoupon = null;
                    this.orderForm.get('couponCode')?.setValue('');
                }
                this.couponLoading = false;
                this.calculateOrderTotals();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al validar el cupón: ' + error.message
                });
                this.selectedCoupon = null;
                this.orderForm.get('couponCode')?.setValue('');
                this.couponLoading = false;
                this.calculateOrderTotals();
            }
        });
    }

    getCouponDisplayValue(coupon: DiscountCoupon): string {
        if (coupon.discountType === 'percentage') {
            return `${coupon.code} - ${coupon.discountValue}%`;
        } else {
            return `${coupon.code} - $${coupon.discountValue.toLocaleString('es-AR')}`;
        }
    }

    getDiscountPercentage(): number {
        const subtotal = this.orderForm.get('subtotal')?.value || 0;
        const couponDiscount = this.orderForm.get('couponDiscount')?.value || 0;

        if (subtotal > 0 && couponDiscount > 0) {
            return Math.round((couponDiscount / subtotal) * 100);
        }
        return 0;
    }

    clearCoupon(): void {
        this.selectedCoupon = null;
        this.orderForm.get('couponCode')?.setValue('');
        this.orderForm.get('couponDiscount')?.setValue(0);
        this.calculateOrderTotals();

        this.messageService.add({
            severity: 'info',
            summary: 'Cupón removido',
            detail: 'El cupón ha sido removido del pedido'
        });
    }

    private updateCouponUsage(coupon: DiscountCoupon): void {
        // Update coupon usage through service
        this.couponsService.applyCouponUsage(coupon.code).subscribe(() => {
            // Reload available coupons
            this.loadCoupons();
        });
    }

    saveOrder(): void {
        if (this.orderForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'Por favor completa todos los campos requeridos correctamente'
            });
            return;
        }

        const formValue = this.orderForm.value;
        const selectedCustomer = this.customers.find(c => c.id === formValue.customerId);

        if (!selectedCustomer) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Cliente no encontrado'
            });
            return;
        }

        if (!formValue.items || formValue.items.length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe agregar al menos un producto al pedido'
            });
            return;
        }

        // Build order items
        const orderItems = formValue.items.map((item: any) => {
            const selectedProduct = this.products.find(p => p.id === item.productId);
            if (!selectedProduct) {
                throw new Error(`Producto no encontrado: ${item.productId}`);
            }
            const grossSubtotal = item.quantity * item.unitPrice;
            const totalProductDiscount = (item.productDiscount || 0) * item.quantity;
            return new OrderItem({
                id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                productId: selectedProduct.id,
                color: item.color || undefined,
                size: item.size || undefined,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productDiscount: item.productDiscount || 0,
                subtotal: Math.max(0, grossSubtotal - totalProductDiscount)
            });
        });

        const orderData = new Order({
            id: formValue.id,
            date: formValue.date,
            customer: selectedCustomer,
            items: orderItems,
            couponCode: formValue.couponCode || undefined,
            subtotal: formValue.subtotal,
            couponDiscount: formValue.couponDiscount,
            shippingPrice: formValue.shippingPrice || 0,
            total: formValue.total,
            status: formValue.status,
            paymentMethod: formValue.paymentMethod,
            notes: formValue.notes,
            // Shipping address
            shippingAddress: formValue.shippingAddress,
            shippingCity: formValue.shippingCity,
            shippingProvince: formValue.shippingProvince,
            shippingPostalCode: formValue.shippingPostalCode,
            shippingFloorApartment: formValue.shippingFloorApartment
        });

        this.orderLoading = true;

        if (this.editingOrder) {
            // Update existing order
            const updatedOrder = new Order({
                ...this.editingOrder,
                ...orderData
            });
            this.ordersService.updateOrder(updatedOrder).subscribe({
                next: (order) => {
                    const index = this.orders.findIndex(o => o.id === order.id);
                    if (index !== -1) {
                        this.orders[index] = order;
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Pedido actualizado correctamente'
                    });
                    this.showOrderDialog = false;
                    this.editingOrder = null;
                    this.selectedCoupon = null;
                    this.orderLoading = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el pedido: ' + error.message
                    });
                    this.orderLoading = false;
                }
            });
        } else {
            // Create new order
            this.ordersService.createOrder(orderData).subscribe({
                next: (newOrder) => {
                    this.orders.push(newOrder);

                    // Update coupon usage if a coupon was applied
                    if (this.selectedCoupon && formValue.couponCode) {
                        this.updateCouponUsage(this.selectedCoupon);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Pedido creado correctamente'
                    });
                    this.showOrderDialog = false;
                    this.editingOrder = null;
                    this.selectedCoupon = null;
                    this.orderLoading = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear el pedido: ' + error.message
                    });
                    this.orderLoading = false;
                }
            });
        }
    }

    viewOrder(order: Order): void {
        this.selectedOrder = order;
        this.showOrderDetailsDialog = true;
    }

    editOrder(order: Order): void {
        // Set the order and open dialog immediately
        this.editingOrder = order;
        this.showOrderDialog = true;

        // Then populate the form data
        this.populateOrderForm(order);
    }

    closeOrderDialog(): void {
        this.showOrderDialog = false;
        this.editingOrder = null;
        this.selectedCoupon = null;
    }

    private populateOrderForm(order: Order): void {
        // Clear items array first
        while (this.orderItemsArray.length !== 0) {
            this.orderItemsArray.removeAt(0);
        }

        // Prepare order data for form
        const orderData = {
            id: order.id,
            date: order.date,
            customerId: order.customer.id,
            couponCode: order.couponCode || '',
            subtotal: order.subtotal,
            couponDiscount: order.couponDiscount,
            shippingPrice: order.shippingPrice || 0,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
            notes: order.notes || '',
            // Shipping address from order
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingProvince: order.shippingProvince,
            shippingPostalCode: order.shippingPostalCode,
            shippingFloorApartment: order.shippingFloorApartment || ''
        };

        // Set form values
        this.orderForm.patchValue(orderData);

        // If there's a coupon code, find and set the selected coupon
        if (order.couponCode) {
            this.couponsService.getCouponByCode(order.couponCode).subscribe(coupon => {
                if (coupon) {
                    this.selectedCoupon = coupon;
                }
            });
        }

        // Prepare items data for form array
        const itemsData = order.items.map(item => ({
            productId: item.productId,
            color: item.color || '',
            size: item.size || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            productDiscount: item.productDiscount || 0
        }));

        // Create form groups for each item and add them to the array
        itemsData.forEach(itemData => {
            const itemGroup = this.fb.group({
                productId: [itemData.productId, Validators.required],
                color: [itemData.color],
                size: [itemData.size],
                quantity: [itemData.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [itemData.unitPrice, [Validators.required, Validators.min(0)]],
                productDiscount: [itemData.productDiscount, [Validators.min(0)]]
            });
            this.orderItemsArray.push(itemGroup);
        });
    }

    confirmDeleteOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el pedido ID: ${order.id} - ${order.customer.name} ${order.customer.lastName}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteOrder(order);
            }
        });
    }

    deleteOrder(order: Order): void {
        this.ordersService.deleteOrder(order.id).subscribe({
            next: () => {
                this.orders = this.orders.filter(o => o.id !== order.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Pedido eliminado',
                    detail: `El pedido ID: ${order.id} - ${order.customer.name} ${order.customer.lastName} ha sido eliminado correctamente`
                });
                // Reload sales summary
                this.loadSalesData();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el pedido: ' + error.message
                });
            }
        });
    }

    exportOrders(): void {
        this.ordersService.exportOrders().subscribe({
            next: (csvContent) => {
                // Create and download CSV file
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Exportación exitosa',
                    detail: 'Los pedidos han sido exportados correctamente'
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al exportar los pedidos: ' + error.message
                });
            }
        });
    }

    // Table sorting method
    onSort(event: any): void {
        // This method is called when table columns are sorted
        // The PrimeNG table handles sorting automatically, so this method can be empty
        // or you can add custom sorting logic here if needed
        console.log('Sort event:', event);
    }

    // Customer Details Dialog Methods
    openCustomerDetailsDialog(customer: Customer): void {
        this.selectedCustomer = customer;
        this.showCustomerDetailsDialog = true;
    }

    getCustomerOrders(customerId: string): Order[] {
        return this.orders.filter(order => order.customer.id === customerId);
    }

    getPendingOrders(): Order[] {
        return this.orders.filter(order => order.status === 'pendiente');
    }

    getProductName(productId: string): string {
        const product = this.products.find(p => p.id === productId);
        return product?.name || `Producto ${productId}`;
    }

    getProductNameForOrderItem(item: any): string {
        return item.getProductName(this.products);
    }

    // Helper methods for item calculations
    getItemGrossSubtotal(index: number): number {
        const item = this.orderItemsArray.at(index);
        if (item) {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            return quantity * unitPrice;
        }
        return 0;
    }

    getItemTotalDiscount(index: number): number {
        const item = this.orderItemsArray.at(index);
        if (item) {
            const quantity = item.get('quantity')?.value || 0;
            const productDiscount = item.get('productDiscount')?.value || 0;
            return productDiscount * quantity;
        }
        return 0;
    }

    getItemSubtotal(index: number): number {
        const grossSubtotal = this.getItemGrossSubtotal(index);
        const totalDiscount = this.getItemTotalDiscount(index);
        return Math.max(0, grossSubtotal - totalDiscount);
    }

    getItemFinalPrice(index: number): number {
        const item = this.orderItemsArray.at(index);
        if (item) {
            const unitPrice = item.get('unitPrice')?.value || 0;
            const productDiscount = item.get('productDiscount')?.value || 0;
            return Math.max(0, unitPrice - productDiscount);
        }
        return 0;
    }

    getItemDiscountPercentage(index: number): number {
        const grossSubtotal = this.getItemGrossSubtotal(index);
        const totalDiscount = this.getItemTotalDiscount(index);
        if (grossSubtotal > 0) {
            return Math.round((totalDiscount / grossSubtotal) * 100);
        }
        return 0;
    }

    getColorValue(colorName: string): string {
        const colorMap: { [key: string]: string } = {
            'Blanco': '#FFFFFF',
            'Negro': '#000000',
            'Gris': '#808080',
            'Azul': '#0000FF',
            'Rojo': '#FF0000',
            'Verde': '#008000',
            'Amarillo': '#FFFF00',
            'Naranja': '#FFA500',
            'Rosa': '#FFC0CB',
            'Violeta': '#800080',
            'Marrón': '#A52A2A',
            'Beige': '#F5F5DC'
        };
        return colorMap[colorName] || '#CCCCCC'; // Default gray if color not found
    }

    getAvailableColorsForItem(itemIndex: number): { label: string, value: string }[] {
        const item = this.orderItemsArray.at(itemIndex);
        const productId = item.get('productId')?.value;

        if (!productId) {
            return [];
        }

        const product = this.products.find(p => p.id === productId);
        if (!product || !product.variants) {
            return [];
        }

        return product.variants
            .filter(variant => {
                // Only include variants that have at least one size with stock > 0
                return variant.sizes?.some(sizeStock => sizeStock.stock > 0);
            })
            .map(variant => ({
                label: variant.color,
                value: variant.color
            }));
    }

    getAvailableSizesForItem(itemIndex: number): { label: string, value: string }[] {
        const item = this.orderItemsArray.at(itemIndex);
        const productId = item.get('productId')?.value;
        const selectedColor = item.get('color')?.value;

        if (!productId || !selectedColor) {
            return [];
        }

        const product = this.products.find(p => p.id === productId);
        if (!product || !product.variants) {
            return [];
        }

        const variant = product.variants.find(v => v.color === selectedColor);
        if (!variant || !variant.sizes) {
            return [];
        }

        // Order sizes from smallest to largest
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return variant.sizes
            .filter(sizeStock => sizeStock.stock > 0)
            .sort((a, b) => {
                const idxA = sizeOrder.indexOf(a.size);
                const idxB = sizeOrder.indexOf(b.size);
                if (idxA === -1 && idxB === -1) return a.size.localeCompare(b.size);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            })
            .map(sizeStock => ({
                label: sizeStock.size,
                value: sizeStock.size
            }));
    }

    onVariantChange(itemIndex: number): void {
        const item = this.orderItemsArray.at(itemIndex);
        const selectedColor = item.get('color')?.value;
        const selectedSize = item.get('size')?.value;

        // Reset size if color changed and current size is not available for new color
        if (selectedColor && selectedSize) {
            const availableSizes = this.getAvailableSizesForItem(itemIndex);
            const sizeExists = availableSizes.some(size => size.value === selectedSize);

            if (!sizeExists) {
                item.get('size')?.setValue('');
            }
        }

        // Trigger recalculation
        this.onItemChange();
    }

} 