import { Customer } from './customer';

export class OrderItem {

    id: string;
    productId: string; // Just store the product ID
    quantity: number;
    unitPrice: number;
    productDiscount: number; // Product-specific discount amount
    subtotal: number;
    // Variant information
    color?: string;
    size?: string;

    constructor(init?: Partial<OrderItem>) {
        this.id = init?.id || '';
        this.productId = init?.productId || '';
        this.quantity = init?.quantity || 0;
        this.unitPrice = init?.unitPrice || 0;
        this.productDiscount = init?.productDiscount || 0;
        this.subtotal = init?.subtotal || 0;
        this.color = init?.color;
        this.size = init?.size;
    }

    calculateSubtotal(): number {
        const grossSubtotal = this.getGrossSubtotal();
        const totalProductDiscount = this.productDiscount * this.quantity;
        this.subtotal = Math.max(0, grossSubtotal - totalProductDiscount);
        return this.subtotal;
    }

    getGrossSubtotal(): number {
        return this.quantity * this.unitPrice;
    }

    getProductDiscountPercentage(): number {
        const grossSubtotal = this.getGrossSubtotal();
        if (grossSubtotal > 0) {
            const totalProductDiscount = this.productDiscount * this.quantity;
            return Math.round((totalProductDiscount / grossSubtotal) * 100);
        }
        return 0;
    }

    getFinalPrice(): number {
        // Final price is the subtotal (after product discount)
        return this.subtotal;
    }

    // Helper method to validate the item
    isValid(): boolean {
        return this.quantity > 0 && this.unitPrice >= 0 && this.productDiscount >= 0;
    }

    // Helper method to get the effective discount amount
    getEffectiveDiscount(): number {
        const grossSubtotal = this.getGrossSubtotal();
        const totalProductDiscount = this.productDiscount * this.quantity;
        return Math.min(totalProductDiscount, grossSubtotal);
    }

    // Helper method to get product info when needed
    getProductInfo(products: any[]): any {
        return products.find(p => p.id === this.productId);
    }

    // Enhanced method to get product with caching
    private _cachedProduct: any = null;
    private _lastProductFetch: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    getProductInfoWithCache(products: any[]): any {
        const now = Date.now();
        
        // Return cached product if still valid
        if (this._cachedProduct && (now - this._lastProductFetch) < this.CACHE_DURATION) {
            return this._cachedProduct;
        }

        // Fetch and cache new product
        this._cachedProduct = products.find(p => p.id === this.productId);
        this._lastProductFetch = now;
        
        return this._cachedProduct;
    }

    // Method to get product name with fallback
    getProductName(products: any[]): string {
        const product = this.getProductInfoWithCache(products);
        return product?.name || `Producto ${this.productId}`;
    }

    // Method to get product image with fallback
    getProductImage(products: any[]): string {
        const product = this.getProductInfoWithCache(products);
        if (product?.variants && product.variants.length > 0) {
            // Try to find image for the specific variant
            const variant = product.variants.find((v: any) => v.color === this.color);
            return variant?.image || product.variants[0].image;
        }
        return product?.image || '/assets/images/default-product.jpg';
    }
}

export class Order {

    id: string;
    date: Date;
    customer: Customer;
    items: OrderItem[];
    couponCode?: string;
    subtotal: number; // Subtotal after product discounts
    couponDiscount: number; // Coupon discount applied to subtotal
    shippingPrice: number;
    total: number;
    status: 'pendiente' | 'confirmado' | 'en_proceso' | 'despachado' | 'entregado' | 'cancelado';
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago';
    notes?: string;
    // Shipping address fields
    shippingAddress: string;
    shippingCity: string;
    shippingProvince: string;
    shippingPostalCode: string;
    shippingFloorApartment?: string;

    constructor(init?: Partial<Order>) {
        this.id = init?.id || '';
        this.date = init?.date || new Date();
        this.customer = init?.customer ? new Customer(init.customer) : new Customer();
        this.items = init?.items?.map(item => new OrderItem(item)) || [];
        this.couponCode = init?.couponCode;
        this.subtotal = init?.subtotal || 0;
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
        return this.items.reduce((sum, item) => sum + (item.productDiscount * item.quantity), 0);
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

    // Helper method to get items with product information
    getItemsWithProducts(products: any[]): any[] {
        return this.items.map(item => ({
            ...item,
            product: item.getProductInfo(products)
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

} 