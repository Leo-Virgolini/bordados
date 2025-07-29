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
import { Order, OrderItem } from '../../../../models/order';
import { SalesSummary } from '../../../../models/sales-summary';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../models/product';
import { ProductCustomizable } from '../../../../models/product-customizable';
import { CouponsService } from '../../../../services/coupons.service';
import { Customer } from '../../../../models/customer';
import { CustomersService } from '../../../../services/customers.service';
import { Coupon } from '../../../../models/coupon';

@Component({
    selector: 'app-orders-tab',
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
        Textarea,
        InputGroup,
        InputGroupAddon,
        DatePickerModule,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './orders-tab.component.html',
    styleUrl: './orders-tab.component.scss'
})
export class OrdersTabComponent implements OnInit {

    // Orders Management
    orders: Order[] = [];
    products: Product[] = [];
    customers: Customer[] = [];
    salesSummary: SalesSummary = new SalesSummary({
        monthlySales: 0,
        monthlyOrders: 0,
        newCustomers: 0,
        averageTicket: 0
    });
    ordersLoading: boolean = false;

    // Order Dialog
    showOrderDialog: boolean = false;
    editingOrder: Order | null = null;
    orderForm!: FormGroup;
    orderLoading: boolean = false;

    // Coupon Management
    availableCoupons: Coupon[] = [];
    selectedCoupon: Coupon | null = null;
    couponLoading: boolean = false;

    // Order Details Dialog
    showOrderDetailsDialog: boolean = false;
    selectedOrder: Order | null = null;

    // Tab Management
    activeTabIndex: number = 0;

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
        private customersService: CustomersService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadSalesData();
        this.loadProducts();
        this.loadCoupons();
        this.loadCustomers();
        this.initForms();
    }

    private initForms(): void {
        this.orderForm = this.fb.group({
            id: ['', Validators.required],
            date: [new Date(), Validators.required],
            customerId: ['', Validators.required],
            items: this.fb.array([]),
            couponCode: [''],
            couponDiscount: [0],
            shippingPrice: [0],
            subtotal: [0],
            total: [0],
            status: ['pendiente', Validators.required],
            paymentMethod: ['efectivo', Validators.required],
            notes: [''],
            shippingAddress: ['', Validators.required],
            shippingCity: ['', Validators.required],
            shippingProvince: ['', Validators.required],
            shippingPostalCode: ['', Validators.required],
            shippingFloorApartment: ['']
        });

        // Add initial item
        this.addOrderItem();
    }

    private loadSalesData(): void {
        this.ordersLoading = true;

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

    private loadCustomers(): void {
        this.customersService.getCustomers().subscribe({
            next: (customers) => {
                this.customers = customers;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los clientes: ' + error.message
                });
            }
        });
    }

    private loadOrders(): void {
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
                customerId: order.customerId,
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
                product: item.productSnapshot,
                quantity: item.quantity,
                selectedColor: item.productSnapshot.variant?.color || '',
                selectedSize: item.productSnapshot.variant?.size || ''
            }));

            // Create form groups for each item and add them to the array
            itemsData.forEach(itemData => {
                const itemGroup = this.fb.group({
                    productSnapshot: [itemData.product, Validators.required],
                    quantity: [itemData.quantity, [Validators.required, Validators.min(1)]],
                    selectedColor: [itemData.selectedColor, Validators.required],
                    selectedSize: [itemData.selectedSize, Validators.required]
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
        const itemForm = this.fb.group({
            productSnapshot: [null, Validators.required],
            selectedColor: [null, Validators.required],
            selectedSize: [null, Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
        this.orderItemsArray.push(itemForm);
        this.calculateOrderTotals();
    }

    removeOrderItem(index: number): void {
        this.orderItemsArray.removeAt(index);
        this.calculateOrderTotals();
    }

    calculateOrderTotals(): void {
        let subtotal = 0;

        this.orderItemsArray.controls.forEach((itemControl: any) => {
            const productSnapshot = itemControl.get('productSnapshot')?.value;
            const quantity = itemControl.get('quantity')?.value || 0;

            if (productSnapshot && quantity > 0) {
                const basePrice = productSnapshot.price || 0;
                const discount = productSnapshot.discount || 0;
                const unitPrice = Math.max(0, basePrice - discount);
                subtotal += unitPrice * quantity;
            }
        });

        const couponDiscount = this.orderForm.get('couponDiscount')?.value || 0;
        const shippingPrice = this.orderForm.get('shippingPrice')?.value || 0;
        const total = Math.max(0, subtotal - couponDiscount + shippingPrice);

        this.orderForm.patchValue({
            subtotal: subtotal,
            total: total
        }, { emitEvent: false });
    }

    onItemChange(): void {
        this.calculateOrderTotals();
    }

    onProductChange(index: number): void {
        const itemControl = this.orderItemsArray.at(index);
        itemControl.patchValue({ selectedColor: null, selectedSize: null });
        this.calculateOrderTotals();
    }

    onVariantChange(index: number): void {
        const itemControl = this.orderItemsArray.at(index);
        itemControl.patchValue({ color: '', size: '' });
        this.calculateOrderTotals();
    }

    getAvailableColorsForItem(index: number): string[] {
        const productSnapshot = this.orderItemsArray.at(index).get('productSnapshot')?.value;
        if (!productSnapshot || !productSnapshot.variant) return [];
        return [productSnapshot.variant.color];
    }

    getAvailableSizesForItem(index: number): string[] {
        const productSnapshot = this.orderItemsArray.at(index).get('productSnapshot')?.value;
        if (!productSnapshot || !productSnapshot.variant) return [];
        return [productSnapshot.variant.size];
    }

    onColorChange(index: number): void {
        const itemControl = this.orderItemsArray.at(index);
        itemControl.patchValue({ size: '' });
        this.calculateOrderTotals();
    }

    onSizeChange(): void {
        this.calculateOrderTotals();
    }

    onCustomerChange(): void {
        // Customer selection changed
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

    getCouponDisplayValue(coupon: Coupon): string {
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

    private updateCouponUsage(coupon: Coupon): void {
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
                summary: 'Error',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        this.orderLoading = true;

        try {
            const formValue = this.orderForm.value;
            const selectedCustomer = this.customers.find(c => c.id === formValue.customerId);

            if (!selectedCustomer) {
                throw new Error('Cliente no encontrado');
            }

            // Build order items with selected variants
            const orderItems: OrderItem[] = formValue.items.map((itemForm: any) => {
                const product = itemForm.product;
                const selectedColor = itemForm.selectedColor;
                const selectedSize = itemForm.selectedSize;

                // Create a product snapshot with only the selected variant
                const productSnapshot = { ...product };
                if (product.variants) {
                    const selectedVariant = product.variants.find((v: any) => v.color === selectedColor);
                    if (selectedVariant) {
                        // Keep only the selected variant with the selected size
                        productSnapshot.variants = [{
                            ...selectedVariant,
                            sizes: selectedVariant.sizes.filter((s: any) => s.size === selectedSize)
                        }];
                    }
                }

                return new OrderItem({
                    productSnapshot: productSnapshot,
                    quantity: itemForm.quantity
                });
            });

            const orderData = {
                date: new Date(),
                customer: selectedCustomer,
                items: orderItems,
                couponCode: formValue.couponCode,
                subtotal: formValue.subtotal,
                couponDiscount: formValue.couponDiscount,
                shippingPrice: formValue.shippingPrice,
                total: formValue.total,
                status: formValue.status,
                paymentMethod: formValue.paymentMethod,
                notes: formValue.notes,
                shippingAddress: formValue.shippingAddress,
                shippingCity: formValue.shippingCity,
                shippingProvince: formValue.shippingProvince,
                shippingPostalCode: formValue.shippingPostalCode,
                shippingFloorApartment: formValue.shippingFloorApartment
            };

            if (this.editingOrder) {
                // Update existing order
                const updatedOrder = new Order({
                    ...this.editingOrder,
                    ...orderData
                });

                this.ordersService.updateOrder(updatedOrder).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Pedido actualizado correctamente'
                        });
                        this.closeOrderDialog();
                        this.loadOrders();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el pedido: ' + error.message
                        });
                    }
                });
            } else {
                // Create new order
                this.ordersService.createOrder(orderData as any).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Pedido creado correctamente'
                        });
                        this.closeOrderDialog();
                        this.loadOrders();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el pedido: ' + error.message
                        });
                    }
                });
            }
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message
            });
        } finally {
            this.orderLoading = false;
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
        this.orderForm.patchValue({
            id: order.id,
            date: order.date,
            customerId: order.customerId,
            couponCode: order.couponCode,
            couponDiscount: order.couponDiscount,
            shippingPrice: order.shippingPrice,
            subtotal: order.subtotal,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
            notes: order.notes,
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingProvince: order.shippingProvince,
            shippingPostalCode: order.shippingPostalCode,
            shippingFloorApartment: order.shippingFloorApartment
        });

        // Clear existing items
        while (this.orderItemsArray.length !== 0) {
            this.orderItemsArray.removeAt(0);
        }

        // Add items with their variants
        order.items.forEach(item => {
            const itemForm = this.fb.group({
                productSnapshot: [item.productSnapshot, Validators.required],
                selectedColor: [item.productSnapshot.variant?.color || '', Validators.required],
                selectedSize: [item.productSnapshot.variant?.size || '', Validators.required],
                quantity: [item.quantity, [Validators.required, Validators.min(1)]]
            });
            this.orderItemsArray.push(itemForm);
        });

        this.calculateOrderTotals();
    }

    confirmDeleteOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el pedido ID: ${order.id} - ${order.getCustomerName()}?`,
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
                    detail: `El pedido ID: ${order.id} - ${order.getCustomerName()} ha sido eliminado correctamente`
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

    // Helper methods
    getProductName(product: Product | ProductCustomizable): string {
        return product?.name || 'Producto no disponible';
    }

    // Helper methods for item calculations
    getItemUnitPrice(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const productSnapshot = itemControl.get('productSnapshot')?.value;
        if (!productSnapshot) return 0;

        const basePrice = productSnapshot.price || 0;
        const discount = productSnapshot.discount || 0;
        return Math.max(0, basePrice - discount);
    }

    getItemGrossSubtotal(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl.get('product')?.value;
        const quantity = itemControl.get('quantity')?.value || 0;

        if (!product) return 0;
        return (product.price || 0) * quantity;
    }

    getItemTotalDiscount(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl.get('product')?.value;
        const quantity = itemControl.get('quantity')?.value || 0;

        if (!product) return 0;
        const discount = (product as any)?.discount || 0;
        return discount * quantity;
    }

    getItemSubtotal(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl.get('product')?.value;
        const quantity = itemControl.get('quantity')?.value || 0;

        if (!product) return 0;
        const basePrice = product.price || 0;
        const discount = (product as any)?.discount || 0;
        const unitPrice = Math.max(0, basePrice - discount);
        return unitPrice * quantity;
    }

    getItemFinalPrice(index: number): number {
        const item = this.orderItemsArray.at(index);
        if (item) {
            const product = item.get('product')?.value;
            if (product) {
                const unitPrice = (product.price || 0) - (product.discount || 0);
                return Math.max(0, unitPrice);
            }
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

} 