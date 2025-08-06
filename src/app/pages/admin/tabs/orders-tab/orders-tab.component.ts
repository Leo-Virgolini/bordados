import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';

// Shared Components
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';

// Models and Services
import { Order, CustomerSnapshot, OrderItem } from '../../../../models/order';
import { Customer } from '../../../../models/customer';
import { ProductEmbroided } from '../../../../models/product-embroided';
import { ProductCustomizable } from '../../../../models/product-customizable';
import { Coupon } from '../../../../models/coupon';
import { SalesSummary } from '../../../../models/sales-summary';
import { OrdersService } from '../../../../services/orders.service';
import { CustomersService } from '../../../../services/customers.service';
import { ProductsService } from '../../../../services/products.service';
import { CouponsService } from '../../../../services/coupons.service';

@Component({
    selector: 'app-orders-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        TabsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        DialogModule,
        CardModule,
        TagModule,
        TextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
        DatePickerModule,
        TooltipModule,
        ImageModule,
        ErrorHelperComponent
    ],
    templateUrl: './orders-tab.component.html',
    styleUrls: ['./orders-tab.component.scss']
})
export class OrdersTabComponent implements OnInit {
    // Properties
    orders: Order[] = [];
    products: ProductEmbroided[] = [];
    customizableProducts: ProductCustomizable[] = [];
    allProducts: (ProductEmbroided | ProductCustomizable)[] = [];
    customers: Customer[] = [];
    salesSummary: SalesSummary = new SalesSummary({
        monthlySales: 0,
        monthlyOrders: 0,
        newCustomers: 0,
        averageTicket: 0
    });

    // Loading states
    ordersLoading: boolean = false;

    // Dialog states
    showOrderDialog: boolean = false;
    editingOrder: Order | null = null;
    orderForm!: FormGroup;
    orderLoading: boolean = false;

    // Coupon management
    availableCoupons: Coupon[] = [];
    selectedCoupon: Coupon | null = null;
    couponLoading: boolean = false;

    // Order details dialog
    showOrderDetailsDialog: boolean = false;
    selectedOrder: Order | null = null;

    // Tab management
    activeTabIndex: number = 0;

    // Order status options
    orderStatusOptions = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Confirmado', value: 'confirmado' },
        { label: 'En Proceso', value: 'en_proceso' },
        { label: 'Despachado', value: 'despachado' },
        { label: 'Entregado', value: 'entregado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

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
        private customersService: CustomersService,
        private productsService: ProductsService,
        private couponsService: CouponsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadSalesData();
        this.loadProducts();
        this.loadCoupons();
        this.loadCustomers();
        this.loadOrders();
    }

    private initForms(): void {
        this.orderForm = this.fb.group({
            id: [''],
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
        // Load regular products
        this.productsService.getEmbroidedProducts().subscribe({
            next: (products) => {
                this.products = products;
                console.log('Regular products loaded:', products.length);
                this.updateAllProducts();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos: ' + error.message
                });
            }
        });

        // Load customizable products
        this.productsService.getCustomizableProducts().subscribe({
            next: (customizableProducts) => {
                this.customizableProducts = customizableProducts;
                console.log('Customizable products loaded:', customizableProducts.length);
                this.updateAllProducts();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos personalizables: ' + error.message
                });
            }
        });
    }

    private updateAllProducts(): void {
        this.allProducts = [...this.products, ...this.customizableProducts];
        console.log('All products combined:', this.allProducts.length);
    }

    private loadCoupons(): void {
        // Load active coupons from service
        this.couponsService.getCoupons().subscribe({
            next: (coupons) => {
                this.availableCoupons = coupons.filter(coupon => coupon.active);
                console.log('Available coupons loaded:', this.availableCoupons.length);
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
                console.log('Customers loaded:', customers.length);
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
                console.log('Orders loaded:', orders.length);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los pedidos: ' + error.message
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

    // Order status helpers
    getOrderStatusLabel(estado: string): string {
        const statusMap: { [key: string]: string } = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_proceso': 'En Proceso',
            'despachado': 'Despachado',
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
            'despachado': 'secondary',
            'entregado': 'success',
            'cancelado': 'danger'
        };
        return severityMap[estado] || 'info';
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
    trackByIndex(index: number): number {
        return index;
    }

    get orderItemsArray() {
        return this.orderForm.get('items') as FormArray;
    }

    openOrderDialog(order?: Order): void {

        // Initialize form if not exists
        if (!this.orderForm) {
            this.initForms();
        }

        // Reset form array
        while (this.orderItemsArray.length !== 0) {
            this.orderItemsArray.removeAt(0);
        }

        // Open dialog
        this.showOrderDialog = true;

        if (order) {
            this.editingOrder = order;
            this.populateDialogForm(order);
        } else {
            this.editingOrder = null;
            this.resetForm();
            // Add one item for new orders
            this.addOrderItem();
        }
    }

    private resetForm(): void {
        this.orderForm.reset({
            id: '',
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
            shippingAddress: '',
            shippingCity: '',
            shippingProvince: '',
            shippingPostalCode: '',
            shippingFloorApartment: ''
        });

        // Disable ID field for new orders (will be generated by backend)
        this.orderForm.get('id')?.disable();
    }

    private populateDialogForm(order: Order): void {
        // Populate form with order data
        this.orderForm.patchValue({
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
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingProvince: order.shippingProvince,
            shippingPostalCode: order.shippingPostalCode,
            shippingFloorApartment: order.shippingFloorApartment || ''
        });

        // Disable ID field when editing
        if (this.editingOrder) {
            this.orderForm.get('id')?.disable();
        }

        // Clear existing items
        while (this.orderItemsArray.length !== 0) {
            this.orderItemsArray.removeAt(0);
        }

        // Add order items
        order.items.forEach((item) => {
            // Find the actual product object from allProducts
            const foundProduct = this.allProducts.find(p => p.id === item.productId);

            // Create the form group first
            const itemForm = this.fb.group({
                product: [null as any, Validators.required],
                quantity: [1, [Validators.required, Validators.min(1)]],
                selectedColor: [{ value: '', disabled: true }, Validators.required],
                selectedSize: [{ value: '', disabled: true }, Validators.required]
            });

            // Add to array first
            this.orderItemsArray.push(itemForm);

            // Set values immediately
            let productToSet = foundProduct;

            // If product not found, create a mock product from snapshot
            if (!foundProduct && item.productSnapshot) {
                productToSet = {
                    id: item.productId,
                    name: item.productSnapshot.name,
                    description: item.productSnapshot.description,
                    price: item.productSnapshot.price,
                    discount: item.productSnapshot.discount,
                    garmentType: item.productSnapshot.garmentType,
                    type: item.productSnapshot.type as 'bordado' | 'personalizable',
                    variants: [{
                        color: item.productSnapshot.variant?.color || '',
                        image: item.productSnapshot.variant?.image || '',
                        sizes: [{
                            size: item.productSnapshot.variant?.size || '',
                            stock: 1
                        }]
                    }],
                    // Include customization data if available
                    threadColor1: item.customization?.threadColor1 ? { code: item.customization.threadColor1, name: 'Color 1' } : undefined,
                    threadColor2: item.customization?.threadColor2 ? { code: item.customization.threadColor2, name: 'Color 2' } : undefined,
                    customText: item.customization?.customText,
                    customTextColor: item.customization?.customTextColor ? { code: item.customization.customTextColor } : undefined,
                    customImage: item.customization?.customImage
                } as any; // Use type assertion to avoid complex type issues

                // Add the mock product to allProducts temporarily so p-select can find it
                if (productToSet) {
                    this.allProducts.push(productToSet as any);
                }
            }

            if (productToSet) {
                itemForm.get('product')?.setValue(productToSet);
            }
            itemForm.get('quantity')?.setValue(item.quantity);
            itemForm.get('selectedColor')?.setValue(item.productSnapshot.variant?.color || '');
            itemForm.get('selectedSize')?.setValue(item.productSnapshot.variant?.size || '');

            // Update disabled states after setting values
            this.updateItemControlStates(this.orderItemsArray.length - 1);
        });

        // Force form update and trigger change detection
        this.orderForm.updateValueAndValidity();
        this.cdr.detectChanges();
        this.calculateOrderTotals();
    }

    addOrderItem(): void {
        const itemForm = this.fb.group({
            product: [null, Validators.required],
            selectedColor: [{ value: null, disabled: true }, Validators.required],
            selectedSize: [{ value: null, disabled: true }, Validators.required],
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
            const product = itemControl.get('product')?.value;
            const quantity = itemControl.get('quantity')?.value || 0;

            if (product && quantity > 0) {
                const basePrice = product.price || 0;
                const discount = product.discount || 0;
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
        itemControl.patchValue({
            selectedColor: null,
            selectedSize: null
        });

        // Update disabled state based on product selection
        this.updateItemControlStates(index);
        this.calculateOrderTotals();
    }

    getAvailableColorsForItem(index: number): any[] {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        if (!product || !product.variants) return [];

        const colors = product.variants
            .map((variant: any) => variant.color)
            .filter((color: string) => color)
            .filter((color: string, index: number, arr: string[]) => arr.indexOf(color) === index);

        return colors.map((color: string) => ({ label: color, value: color }));
    }

    getAvailableSizesForItem(index: number): any[] {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        const selectedColor = this.orderItemsArray.at(index)?.get('selectedColor')?.value;

        if (!product || !product.variants || !selectedColor) return [];

        const variant = product.variants.find((v: any) => v.color === selectedColor);
        if (!variant || !variant.sizes) return [];

        const sizes = variant.sizes
            .map((size: any) => size.size)
            .filter((size: string) => size);

        return sizes.map((size: string) => ({ label: size, value: size }));
    }

    onColorChange(index: number): void {
        const itemControl = this.orderItemsArray.at(index);
        itemControl.patchValue({ selectedSize: null });

        // Update disabled state based on color selection
        this.updateItemControlStates(index);
        this.calculateOrderTotals();
    }

    private updateItemControlStates(index: number): void {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl.get('product')?.value;
        const selectedColor = itemControl.get('selectedColor')?.value;

        // Disable/enable color select based on product selection
        if (product) {
            itemControl.get('selectedColor')?.enable();
        } else {
            itemControl.get('selectedColor')?.disable();
        }

        // Disable/enable size select based on color selection
        if (selectedColor) {
            itemControl.get('selectedSize')?.enable();
        } else {
            itemControl.get('selectedSize')?.disable();
        }
    }

    onSizeChange(): void {
        this.calculateOrderTotals();
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

        this.couponsService.validateCoupon(couponCode, subtotal).subscribe({
            next: (result) => {
                if (result.valid && result.coupon) {
                    this.selectedCoupon = result.coupon;
                    let discountAmount = 0;

                    if (result.coupon.discountType === 'percentage') {
                        discountAmount = subtotal * (result.coupon.discountValue / 100);
                    } else {
                        discountAmount = result.coupon.discountValue;
                    }

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
            const formValue = this.orderForm.getRawValue(); // Use getRawValue to get disabled field values

            // For new orders, use customerId from form. For existing orders, use from editingOrder
            const customerId = this.editingOrder ? this.editingOrder.customerId : formValue.customerId;

            if (!customerId) {
                throw new Error('Cliente no encontrado');
            }

            // Build order items
            const orderItems: OrderItem[] = formValue.items.map((itemForm: any) => {
                const product = itemForm.product;
                const selectedColor = itemForm.selectedColor;
                const selectedSize = itemForm.selectedSize;

                const productSnapshot = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    discount: product.discount || 0,
                    garmentType: product.garmentType,
                    type: product.type,
                    variant: {
                        color: selectedColor,
                        size: selectedSize,
                        image: product.variants?.find((v: any) => v.color === selectedColor)?.image || ''
                    }
                };

                return new OrderItem({
                    productId: product.id,
                    productSnapshot: productSnapshot,
                    quantity: itemForm.quantity,
                    subtotal: itemForm.quantity * (product.price - (product.discount || 0))
                });
            });

            const orderData = {
                id: this.editingOrder ? formValue.id : undefined, // Don't send ID for new orders
                date: formValue.date,
                customerId: customerId,
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
                            detail: `Pedido ID: ${updatedOrder.id} actualizado correctamente`
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
                    },
                    complete: () => {
                        this.orderLoading = false;
                    }
                });
            } else {
                // Create new order
                const newOrder = new Order(orderData);
                this.ordersService.createOrder(newOrder).subscribe({
                    next: (createdOrder) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Pedido ID: ${createdOrder.id} creado correctamente`
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
                    },
                    complete: () => {
                        this.orderLoading = false;
                    }
                });
            }
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message
            });
            this.orderLoading = false;
        }
    }

    viewOrder(order: Order): void {
        this.selectedOrder = order;
        this.showOrderDetailsDialog = true;
    }

    editOrder(order: Order): void {
        this.openOrderDialog(order);
    }

    closeOrderDialog(): void {
        this.showOrderDialog = false;
        this.editingOrder = null;
        this.selectedCoupon = null;

        // Clean up any mock products that were added
        this.cleanupMockProducts();
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

    // Helper methods for item calculations
    getItemUnitPrice(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl?.get('product')?.value;

        if (!product) return 0;

        const basePrice = product.price || 0;
        const discount = product.discount || 0;
        return Math.max(0, basePrice - discount);
    }

    getItemGrossSubtotal(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl?.get('product')?.value;
        const quantity = itemControl?.get('quantity')?.value || 0;

        if (!product) return 0;

        const basePrice = product.price || 0;
        return basePrice * quantity;
    }

    getItemTotalDiscount(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl?.get('product')?.value;
        const quantity = itemControl?.get('quantity')?.value || 0;

        if (!product) return 0;

        const discount = product.discount || 0;
        return discount * quantity;
    }

    getItemSubtotal(index: number): number {
        const itemControl = this.orderItemsArray.at(index);
        const product = itemControl?.get('product')?.value;
        const quantity = itemControl?.get('quantity')?.value || 0;

        if (!product) return 0;

        const basePrice = product.price || 0;
        const discount = product.discount || 0;
        const unitPrice = Math.max(0, basePrice - discount);
        return unitPrice * quantity;
    }

    isItemPersonalized(item: OrderItem): boolean {
        return item.productSnapshot.type === 'personalizable' ||
            item.customization !== undefined;
    }

    getCustomerDisplayName(customer: Customer | CustomerSnapshot | undefined): string {
        if (!customer) return 'N/A';
        return `${customer.name} ${customer.lastName}`.trim();
    }



    // Clean up mock products that were added for editing
    private cleanupMockProducts(): void {
        // Remove any products that were added as mock products (they have high IDs)
        this.allProducts = this.allProducts.filter(product => {
            // Keep only products that were originally loaded (IDs < 1000000)
            return product.id < 1000000;
        });
    }

    // Get product type label for display
    getProductTypeLabel(index: number): string {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        if (!product) return '';

        return product.type === 'personalizable' ? 'Personalizado' : 'Bordado';
    }

    // Get product type severity for styling
    getProductTypeSeverity(index: number): string {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        if (!product) return 'info';

        return product.type === 'personalizable' ? 'warn' : 'success';
    }

    // Check if product is personalizable
    isProductPersonalizado(index: number): boolean {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        return product?.type === 'personalizable';
    }

    // Get thread colors for personalizable products
    getProductThreadColors(index: number): any[] {
        const product = this.orderItemsArray.at(index)?.get('product')?.value;
        if (!product || product.type !== 'personalizable') return [];

        // Get customization data from the original order item
        const originalOrderItem = this.editingOrder?.items[index];
        if (!originalOrderItem?.customization) return [];

        const colors = [];
        if (originalOrderItem.customization.threadColor1) {
            const colorCode = this.getColorCodeById(originalOrderItem.customization.threadColor1);
            const colorName = this.getColorNameById(originalOrderItem.customization.threadColor1);
            colors.push({ code: colorCode, name: colorName });
        }
        if (originalOrderItem.customization.threadColor2) {
            const colorCode = this.getColorCodeById(originalOrderItem.customization.threadColor2);
            const colorName = this.getColorNameById(originalOrderItem.customization.threadColor2);
            colors.push({ code: colorCode, name: colorName });
        }

        console.log('Thread colors for index', index, ':', colors);
        return colors;
    }

    // Get custom text for personalizable products
    getProductCustomText(index: number): string {
        const originalOrderItem = this.editingOrder?.items[index];
        return originalOrderItem?.customization?.customText || '';
    }

    // Get custom text color for personalizable products
    getProductCustomTextColor(index: number): any {
        const originalOrderItem = this.editingOrder?.items[index];
        if (!originalOrderItem?.customization?.customTextColor) return null;

        const colorCode = this.getColorCodeById(originalOrderItem.customization.customTextColor);
        const colorName = this.getColorNameById(originalOrderItem.customization.customTextColor);
        return { code: colorCode, name: colorName };
    }

    // Helper method to convert color ID to color code
    public getColorCodeById(colorId: string): string {
        const colorMap: { [key: string]: string } = {
            '1': '#FF0000', // Rojo Fuego
            '2': '#000080', // Azul Marino
            '3': '#228B22', // Verde Bosque
            '4': '#000000', // Negro
            '5': '#FFFFFF', // Blanco
            '6': '#fffa00'  // Amarillo
        };
        return colorMap[colorId] || '#000000'; // Default to black if not found
    }

    // Helper method to convert color ID to color name
    public getColorNameById(colorId: string): string {
        const colorNameMap: { [key: string]: string } = {
            '1': 'Rojo Fuego',
            '2': 'Azul Marino',
            '3': 'Verde Bosque',
            '4': 'Negro',
            '5': 'Blanco',
            '6': 'Amarillo'
        };
        return colorNameMap[colorId] || 'Color Desconocido'; // Default name if not found
    }


    // Get custom image for personalizable products
    getProductCustomImage(index: number): string {
        const originalOrderItem = this.editingOrder?.items[index];
        return originalOrderItem?.customization?.customImage || '';
    }

    // Download custom image
    downloadCustomImage(imageUrl: string, productName: string): void {
        try {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = imageUrl;

            // Extract filename from URL or create a default one
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1] || 'custom-image';

            // Create a safe filename using product name
            const safeProductName = productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const downloadFilename = `${safeProductName}_${filename}`;

            link.download = downloadFilename;
            link.target = '_blank';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.messageService.add({
                severity: 'success',
                summary: 'Descarga iniciada',
                detail: `Imagen de ${productName} descargada correctamente`,
                life: 3000
            });
        } catch (error) {
            console.error('Error downloading image:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error al descargar',
                detail: 'No se pudo descargar la imagen personalizada',
                life: 3000
            });
        }
    }

    // Download complete order data as Excel
    downloadOrderData(order: Order): void {
        try {
            // Create CSV content for Excel with better structure
            let csvContent = '';

            // Header with company info
            csvContent += 'BORDADOS - REPORTE DE PEDIDO\n';
            csvContent += 'Fecha de Generación,' + new Date().toLocaleDateString('es-AR') + '\n';
            csvContent += 'Hora de Generación,' + new Date().toLocaleTimeString('es-AR') + '\n';
            csvContent += '\n';

            // Order Information Section
            csvContent += '=== INFORMACIÓN DEL PEDIDO ===\n';
            csvContent += 'Campo,Valor\n';
            csvContent += `ID del Pedido,${order.id}\n`;
            csvContent += `Fecha del Pedido,${order.date}\n`;
            csvContent += `Estado,${this.getOrderStatusLabel(order.status)}\n`;
            csvContent += `Método de Pago,${this.getPaymentMethodLabel(order.paymentMethod)}\n`;
            csvContent += '\n';

            // Financial Summary
            csvContent += '=== RESUMEN FINANCIERO ===\n';
            csvContent += 'Concepto,Valor (ARS)\n';
            csvContent += `Subtotal,${order.subtotal.toLocaleString('es-AR')}\n`;
            csvContent += `Descuento Cupón,${order.couponDiscount.toLocaleString('es-AR')}\n`;
            csvContent += `Precio de Envío,${order.shippingPrice.toLocaleString('es-AR')}\n`;
            csvContent += `TOTAL,${order.total.toLocaleString('es-AR')}\n`;
            csvContent += '\n';

            // Customer Information Section
            csvContent += '=== INFORMACIÓN DEL CLIENTE ===\n';
            csvContent += 'Campo,Valor\n';
            csvContent += `Nombre Completo,${order.getCustomerName()}\n`;
            csvContent += `Email,${order.getCustomerEmail()}\n`;
            csvContent += `Teléfono,${order.getCustomerPhone()}\n`;
            csvContent += `DNI,${order.customerSnapshot.dni || 'N/A'}\n`;
            csvContent += '\n';

            // Customer Address
            csvContent += '=== DIRECCIÓN DE RESIDENCIA ===\n';
            csvContent += 'Campo,Valor\n';
            csvContent += `Dirección,${order.customerSnapshot.address || 'N/A'}\n`;
            csvContent += `Ciudad,${order.customerSnapshot.city || 'N/A'}\n`;
            csvContent += `Provincia,${order.customerSnapshot.province || 'N/A'}\n`;
            csvContent += `Código Postal,${order.customerSnapshot.postalCode || 'N/A'}\n`;
            csvContent += `Piso/Depto,${order.customerSnapshot.floorApartment || 'N/A'}\n`;
            csvContent += '\n';

            // Shipping Information Section
            csvContent += '=== DIRECCIÓN DE ENVÍO ===\n';
            csvContent += 'Campo,Valor\n';
            csvContent += `Dirección de Envío,${order.shippingAddress}\n`;
            csvContent += `Ciudad de Envío,${order.shippingCity}\n`;
            csvContent += `Provincia de Envío,${order.shippingProvince}\n`;
            csvContent += `Código Postal de Envío,${order.shippingPostalCode}\n`;
            csvContent += `Piso/Depto de Envío,${order.shippingFloorApartment || 'N/A'}\n`;
            csvContent += '\n';

            // Coupon Information Section
            if (order.couponCode) {
                csvContent += '=== INFORMACIÓN DEL CUPÓN ===\n';
                csvContent += 'Campo,Valor\n';
                csvContent += `Código de Cupón,${order.couponCode}\n`;
                csvContent += `Descuento Aplicado,${order.couponDiscount.toLocaleString('es-AR')} ARS\n`;
                csvContent += '\n';
            }

            // Products Section with better headers
            csvContent += '=== PRODUCTOS DEL PEDIDO ===\n';
            csvContent += 'Producto,Tipo,Cantidad,Color,Talle,Precio Unit. (ARS),Descuento (ARS),Subtotal (ARS),Hilo Color 1,Hilo Color 2,Texto Personalizado,Color Texto,URL Imagen\n';

            order.items.forEach(item => {
                const customization = item.customization;
                const threadColor1 = customization?.threadColor1 ? this.getColorNameById(customization.threadColor1) : '';
                const threadColor2 = customization?.threadColor2 ? this.getColorNameById(customization.threadColor2) : '';
                const customText = customization?.customText || '';
                const customTextColor = customization?.customTextColor ? this.getColorNameById(customization.customTextColor) : '';
                const customImage = customization?.customImage || '';

                csvContent += `"${item.getProductName()}",`;
                csvContent += `${item.productSnapshot.type === 'personalizable' ? 'Personalizado' : 'Bordado'},`;
                csvContent += `${item.quantity},`;
                csvContent += `${item.productSnapshot.variant.color || ''},`;
                csvContent += `${item.productSnapshot.variant.size || ''},`;
                csvContent += `${item.getUnitPrice()},`;
                csvContent += `${item.getProductDiscount()},`;
                csvContent += `${item.subtotal},`;
                csvContent += `"${threadColor1}",`;
                csvContent += `"${threadColor2}",`;
                csvContent += `"${customText}",`;
                csvContent += `"${customTextColor}",`;
                csvContent += `"${customImage}"\n`;
            });

            // Notes Section
            if (order.notes) {
                csvContent += '\n';
                csvContent += '=== NOTAS DEL PEDIDO ===\n';
                csvContent += 'Nota\n';
                csvContent += `"${order.notes}"\n`;
            }

            // Footer
            csvContent += '\n';
            csvContent += '=== FIN DEL REPORTE ===\n';
            csvContent += 'Este reporte fue generado automáticamente por el sistema de gestión de pedidos.\n';

            // Add UTF-8 BOM for proper Excel encoding
            const BOM = '\uFEFF';
            const csvContentWithBOM = BOM + csvContent;

            // Create blob and download
            const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pedido_${order.id}_${new Date().toISOString().split('T')[0]}.csv`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Download images for customized products
            this.downloadCustomImages(order);

            this.messageService.add({
                severity: 'success',
                summary: 'Datos descargados',
                detail: `Datos completos del pedido ${order.id} descargados en Excel correctamente`,
                life: 5000
            });
        } catch (error) {
            console.error('Error downloading order data:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error al descargar',
                detail: 'No se pudieron descargar los datos del pedido',
                life: 3000
            });
        }
    }

    // Download all custom images for an order
    private downloadCustomImages(order: Order): void {
        const customizedItems = order.items.filter(item =>
            item.productSnapshot.type === 'personalizable' && item.customization?.customImage
        );

        if (customizedItems.length === 0) {
            return;
        }

        // Create a delay to avoid overwhelming the browser
        customizedItems.forEach((item, index) => {
            setTimeout(() => {
                if (item.customization?.customImage) {
                    this.downloadCustomImage(
                        item.customization.customImage,
                        `${order.id}_${item.getProductName()}`
                    );
                }
            }, index * 1000); // 1 second delay between downloads
        });
    }

} 