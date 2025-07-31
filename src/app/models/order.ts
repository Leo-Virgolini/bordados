import { Customer } from './customer';
import { Coupon } from './coupon';

export interface ProductSnapshot {
    name: string;
    description: string;
    price: number;
    discount: number;
    garmentType: string;
    type: string;
    variant: {
        color: string;
        size: string;
        image?: string;
    };
}

export interface CustomerSnapshot {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    province: string;
    city: string;
    postalCode: string;
    address: string;
    floorApartment?: string;
}

export interface CustomizationData {
    threadColor1: string;
    threadColor2?: string;
    customText?: string;
    customTextColor?: string;
    customImage: string;
}

export class OrderItem {
    id: number;
    productId: number;
    productSnapshot: ProductSnapshot;
    quantity: number;
    subtotal: number;
    customization?: CustomizationData;

    constructor(init?: Partial<OrderItem>) {
        this.id = init?.id || 0;
        this.productId = init?.productId || 0;
        this.productSnapshot = init?.productSnapshot || {
            name: '',
            description: '',
            price: 0,
            discount: 0,
            garmentType: '',
            type: '',
            variant: {
                color: '',
                image: '',
                size: ''
            }
        };
        this.quantity = init?.quantity || 0;
        this.subtotal = init?.subtotal || 0;
        this.customization = init?.customization;
    }

    calculateSubtotal(): number {
        const unitPrice = this.getUnitPrice();
        this.subtotal = Math.max(0, unitPrice * this.quantity);
        return this.subtotal;
    }

    getUnitPrice(): number {
        // Use productSnapshot.price minus discount
        const basePrice = this.productSnapshot?.price || 0;
        const discount = this.productSnapshot?.discount || 0;
        return Math.max(0, basePrice - discount);
    }

    getGrossSubtotal(): number {
        return (this.productSnapshot?.price || 0) * this.quantity;
    }

    getProductDiscount(): number {
        // Returns per-unit discount from product snapshot
        return this.productSnapshot?.discount || 0;
    }

    getProductDiscountPercentage(): number {
        const grossSubtotal = this.getGrossSubtotal();
        const totalProductDiscount = this.getProductDiscount() * this.quantity;
        if (grossSubtotal > 0) {
            return Math.round((totalProductDiscount / grossSubtotal) * 100);
        }
        return 0;
    }

    getFinalPrice(): number {
        return this.getUnitPrice();
    }

    isValid(): boolean {
        return this.productSnapshot && this.quantity > 0 && this.getUnitPrice() >= 0;
    }

    getEffectiveDiscount(): number {
        return this.getProductDiscount() * this.quantity;
    }

    // Helper methods to get product information
    getProductName(): string {
        return this.productSnapshot?.name || 'Producto no disponible';
    }

    getProductImage(): string {
        if (this.customization?.customImage) {
            return this.customization.customImage;
        }
        return this.productSnapshot?.variant?.image || '';
    }

    getProductType(): string {
        return this.productSnapshot?.type || 'standard';
    }

    // For customizable products
    getThreadColor1(): string {
        return this.customization?.threadColor1 || '';
    }

    getThreadColor2(): string {
        return this.customization?.threadColor2 || '';
    }

    getCustomImage(): string {
        return this.customization?.customImage || '';
    }

    // Get custom text information
    getCustomText(): string {
        return this.customization?.customText || '';
    }

    getCustomTextColor(): string {
        return this.customization?.customTextColor || '';
    }

    hasCustomText(): boolean {
        return this.getCustomText().length > 0;
    }
}

export class Order {
    id: number;
    date: Date;
    customerId: number;
    customerSnapshot: CustomerSnapshot;
    items: OrderItem[];
    couponCode?: string;
    couponDiscount: number; // Coupon discount applied to subtotal
    subtotal: number; // Subtotal after product discounts
    shippingPrice: number;
    total: number;
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago';
    status: 'pendiente' | 'confirmado' | 'en_proceso' | 'despachado' | 'entregado' | 'cancelado';
    // Shipping address fields
    shippingAddress: string;
    shippingCity: string;
    shippingProvince: string;
    shippingPostalCode: string;
    shippingFloorApartment?: string;
    notes?: string;

    constructor(init?: Partial<Order>) {
        this.id = init?.id || 0;
        this.date = init?.date || new Date();
        this.customerId = init?.customerId || 0;
        this.customerSnapshot = init?.customerSnapshot || {
            name: '',
            lastName: '',
            email: '',
            phone: '',
            dni: '',
            province: '',
            city: '',
            postalCode: '',
            address: ''
        };
        this.items = init?.items?.map(item => new OrderItem(item)) || [];
        this.subtotal = init?.subtotal || 0;
        this.couponCode = init?.couponCode;
        this.couponDiscount = init?.couponDiscount || 0;
        this.shippingPrice = init?.shippingPrice || 0;
        this.total = init?.total || 0;
        this.status = init?.status || 'pendiente';
        this.paymentMethod = init?.paymentMethod || 'efectivo';
        this.notes = init?.notes;
        // Initialize shipping address fields
        this.shippingAddress = init?.shippingAddress || '';
        this.shippingCity = init?.shippingCity || '';
        this.shippingProvince = init?.shippingProvince || '';
        this.shippingPostalCode = init?.shippingPostalCode || '';
        this.shippingFloorApartment = init?.shippingFloorApartment;
    }

    calculateTotals(): void {
        this.subtotal = this.items.reduce((sum, item) => sum + item.calculateSubtotal(), 0);
        this.total = Math.max(0, this.subtotal - this.couponDiscount + this.shippingPrice);
    }

    getTaxAmount(): number {
        const taxableAmount = Math.max(0, this.subtotal - this.couponDiscount);
        return taxableAmount * 0.21; // 21% IVA
    }

    getTotalBeforeTax(): number {
        return this.subtotal - this.couponDiscount + this.shippingPrice - this.getTaxAmount();
    }

    getTotalItems(): number {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getGrossSubtotal(): number {
        return this.items.reduce((sum, item) => sum + item.getGrossSubtotal(), 0);
    }

    getTotalProductDiscounts(): number {
        return this.items.reduce((sum, item) => sum + (item.getProductDiscount() * item.quantity), 0);
    }

    getCouponDiscountPercentage(): number {
        if (this.subtotal > 0) {
            return Math.round((this.couponDiscount / this.subtotal) * 100);
        }
        return 0;
    }

    getTotalDiscounts(): number {
        return this.getTotalProductDiscounts() + this.couponDiscount;
    }

    // Helper method to validate the order
    isValid(): boolean {
        return this.items.length > 0 &&
            this.items.every(item => item.isValid()) &&
            this.subtotal >= 0 &&
            this.couponDiscount >= 0 &&
            this.shippingPrice >= 0;
    }

    // Helper method to get effective coupon discount
    getEffectiveCouponDiscount(): number {
        return Math.min(this.couponDiscount, this.subtotal);
    }

    // Coupon-related methods
    applyCoupon(coupon: Coupon): boolean {
        if (!coupon.canBeAppliedToOrder(this.subtotal)) {
            return false;
        }

        this.couponCode = coupon.code;
        this.couponDiscount = coupon.calculateDiscount(this.subtotal);
        this.calculateTotals();
        return true;
    }

    removeCoupon(): void {
        this.couponCode = undefined;
        this.couponDiscount = 0;
        this.calculateTotals();
    }

    hasCouponApplied(): boolean {
        return !!this.couponCode && this.couponDiscount > 0;
    }

    getCouponDiscountAmount(): number {
        return this.couponDiscount;
    }

    // Helper method to get items with product information
    getItemsWithProducts(): any[] {
        return this.items.map(item => ({
            ...item,
            productSnapshot: item.productSnapshot
        }));
    }

    getStatusLabel(): string {
        const statusMap: { [key: string]: string } = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_proceso': 'En Proceso',
            'despachado': 'Despachado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return statusMap[this.status] || this.status;
    }

    getPaymentMethodLabel(): string {
        const methodMap: { [key: string]: string } = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta de Crédito/Débito',
            'transferencia': 'Transferencia Bancaria',
            'mercadopago': 'MercadoPago'
        };
        return methodMap[this.paymentMethod] || this.paymentMethod;
    }

    getFullShippingAddress(): string {
        let address = this.shippingAddress;
        if (this.shippingFloorApartment) {
            address += ` (${this.shippingFloorApartment})`;
        }
        address += `, ${this.shippingCity}, ${this.shippingProvince} - CP: ${this.shippingPostalCode}`;
        return address;
    }

    getShippingAddressSummary(): string {
        return `${this.shippingCity}, ${this.shippingProvince}`;
    }

    isPending(): boolean {
        return this.status === 'pendiente';
    }

    isCompleted(): boolean {
        return this.status === 'entregado';
    }

    isCancelled(): boolean {
        return this.status === 'cancelado';
    }

    canBeCancelled(): boolean {
        return !this.isCompleted() && !this.isCancelled();
    }

    getOrderAge(): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Customer-related methods
    getCustomerName(): string {
        return `${this.customerSnapshot.name} ${this.customerSnapshot.lastName}`.trim();
    }

    getCustomerEmail(): string {
        return this.customerSnapshot.email;
    }

    getCustomerPhone(): string {
        return this.customerSnapshot.phone;
    }

    getCustomerAddress(): string {
        let address = this.customerSnapshot.address;
        if (this.customerSnapshot.floorApartment) {
            address += ` (${this.customerSnapshot.floorApartment})`;
        }
        return address;
    }

    getCustomerLocation(): string {
        return `${this.customerSnapshot.city}, ${this.customerSnapshot.province} (${this.customerSnapshot.postalCode})`;
    }

    // Factory method to create order with customer
    static createFromCustomer(customer: Customer, items: OrderItem[] = []): Order {
        const customerSnapshot: CustomerSnapshot = {
            name: customer.name,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            dni: customer.dni,
            province: customer.province,
            city: customer.city,
            postalCode: customer.postalCode,
            address: customer.address,
            floorApartment: customer.floorApartment
        };

        return new Order({
            customerId: customer.id,
            customerSnapshot,
            items
        });
    }

} 