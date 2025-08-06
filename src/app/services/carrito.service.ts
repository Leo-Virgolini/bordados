import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { ProductCustomizable } from '../models/product-customizable';
import { ProductsService } from './products.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private readonly CART_STORAGE_KEY = 'bordados_cart';
  private items: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  items$: Observable<CartItem[]> = this.items.asObservable();

  isSubmitting = false;

  constructor(private productsService: ProductsService) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);

        // Validate and sanitize cart data
        const validatedItems = this.validateCartItems(cartItems);

        if (validatedItems.length > 0) {
          // Convert plain objects back to CartItem instances
          const restoredItems = validatedItems.map((item: any) => new CartItem(item));
          this.items.next(restoredItems);
        } else {
          // If validation fails, clear the corrupted cart
          this.clearCartFromStorage();
          console.warn('Cart data validation failed - cart cleared');
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // If there's an error, start with empty cart
      this.items.next([]);
      this.clearCartFromStorage();
    }
  }

  private validateCartItems(cartItems: any[]): any[] {
    if (!Array.isArray(cartItems)) {
      console.warn('Invalid cart data: not an array');
      return [];
    }

    const validatedItems: any[] = [];

    for (const item of cartItems) {
      try {
        // Basic structure validation
        if (!this.isValidCartItemStructure(item)) {
          console.warn('Invalid cart item structure:', item);
          continue;
        }

        // Validate product data
        if (!this.isValidProduct(item.product)) {
          console.warn('Invalid product data in cart item:', item);
          continue;
        }

        // Validate quantity
        if (!this.isValidQuantity(item.quantity)) {
          console.warn('Invalid quantity in cart item:', item);
          continue;
        }

        // Validate price integrity
        if (!this.isValidPrice(item)) {
          console.warn('Price tampering detected in cart item:', item);
          continue;
        }

        // Validate total calculation
        if (!this.isValidTotal(item)) {
          console.warn('Total calculation mismatch in cart item:', item);
          continue;
        }

        validatedItems.push(item);
      } catch (error) {
        console.warn('Error validating cart item:', error, item);
        continue;
      }
    }

    return validatedItems;
  }

  private isValidCartItemStructure(item: any): boolean {
    return item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      item.product &&
      typeof item.quantity === 'number';
  }

  private isValidProduct(product: any): boolean {
    return product &&
      typeof product === 'object' &&
      (typeof product.id === 'number' || typeof product.id === 'string') &&
      typeof product.name === 'string' &&
      typeof product.price === 'number' &&
      product.price > 0 &&
      typeof product.type === 'string' &&
      ['bordado', 'personalizable'].includes(product.type);
  }

  private isValidQuantity(quantity: any): boolean {
    return typeof quantity === 'number' &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= 100; // Reasonable maximum
  }

  private isValidPrice(item: any): boolean {
    // Check if the product has a valid price structure
    const product = item.product;

    // Validate that the product has a valid price
    if (!product || typeof product.price !== 'number' || product.price <= 0) {
      console.warn('Invalid product price structure');
      return false;
    }

    // Validate discount if present
    if (product.discount !== undefined && product.discount !== null) {
      if (typeof product.discount !== 'number' || product.discount < 0 || product.discount > 100) {
        console.warn('Invalid discount value');
        return false;
      }
    }

    return true;
  }

  private isValidTotal(item: any): boolean {
    // Verify that the total matches the expected calculation
    const expectedTotal = this.calculateExpectedTotal(item);
    const storedTotal = item.total;

    // Allow for small floating point differences
    const totalDifference = Math.abs(expectedTotal - storedTotal);
    const tolerance = 0.01; // 1 cent tolerance

    if (totalDifference > tolerance) {
      console.warn(`Total mismatch detected: expected ${expectedTotal}, got ${storedTotal}`);
      return false;
    }

    return true;
  }

  private getExpectedProductPrice(product: any): number {
    // Get the current price from the products service
    // This ensures we're using the latest, server-validated price
    if (product.type === 'bordado') {
      // For embroidered products, apply discount if present
      const basePrice = product.price || 0;
      const discount = product.discount || 0;
      return basePrice * (1 - discount / 100);
    } else if (product.type === 'personalizable') {
      // For customizable products, calculate based on base price + options
      let basePrice = product.price || 0;

      // Add second color price if applicable
      if (product.threadColor2) {
        basePrice += 5000; // Second color price
      }

      // Add custom text price if applicable
      if (product.customText) {
        basePrice += 3000; // Custom text price
      }

      return basePrice;
    }

    return product.price || 0;
  }

  private calculateExpectedTotal(item: any): number {
    const unitPrice = this.getExpectedProductPrice(item.product);
    return unitPrice * item.quantity;
  }

  private saveCartToStorage(): void {
    try {
      const cartItems = this.items.value;

      // Validate items before saving
      const validatedItems = this.validateCartItems(cartItems);

      if (validatedItems.length !== cartItems.length) {
        console.warn('Some cart items failed validation and were removed');
        // Update the cart with only validated items
        this.items.next(validatedItems.map(item => new CartItem(item)));
      }

      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.items.value));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  getCarrito(): CartItem[] {
    return this.items.value;
  }

  agregarItem(item: CartItem): boolean {
    // Validate the item before adding
    if (!this.isValidCartItemStructure(item) ||
      !this.isValidProduct(item.product) ||
      !this.isValidQuantity(item.quantity)) {
      return false;
    }

    // Additional stock validation for embroidered products
    if (item.product.type === 'bordado') {
      const availableStock = this.getAvailableStockForVariant(item.product);
      const currentCartQuantity = this.getCartItemQuantityForVariant(
        item.product.id, 
        item.product.variants[0]?.color, 
        item.product.variants[0]?.sizes[0]?.size
      );
      const totalQuantity = currentCartQuantity + item.quantity;

      if (totalQuantity > availableStock) {
        // Don't add the item if it would exceed stock
        return false;
      }
    }

    const actuales = this.items.value;

    // For customized products, always add as new item (they're unique)
    if (item.product.type === 'personalizable') {
      actuales.push(item);
      this.items.next([...actuales]);
      this.saveCartToStorage();
      return true;
    }

    // For regular products, check if same variant already exists
    const existente = actuales.find(i =>
      i.product.type === 'bordado' &&
      i.product.id === item.product.id &&
      i.product.variants[0]?.color === item.product.variants[0]?.color &&
      i.product.variants[0]?.sizes[0]?.size === item.product.variants[0]?.sizes[0]?.size
    );

    if (existente) {
      // Update existing item quantity
      const newQuantity = existente.quantity + item.quantity;
      this.actualizarCantidad(existente.id, newQuantity);
      return true;
    } else {
      actuales.push(item);
      this.items.next([...actuales]);
      this.saveCartToStorage();
      return true;
    }
  }

  eliminarItem(cartItemId: string) {
    const filtrados = this.items.value.filter(i => i.id !== cartItemId);
    this.items.next(filtrados);
    this.saveCartToStorage();
  }

  actualizarCantidad(cartItemId: string, cantidad: number): boolean {
    // Validate quantity before updating
    if (!this.isValidQuantity(cantidad)) {
      return false;
    }

    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.id === cartItemId);

    if (itemIndex !== -1) {
      const item = actuales[itemIndex];
      
      // Additional stock validation for embroidered products
      if (item.product.type === 'bordado') {
        const availableStock = this.getAvailableStockForVariant(item.product);
        if (cantidad > availableStock) {
          // Don't update if it would exceed stock
          return false;
        }
      }

      // Create a new CartItem with updated quantity
      const updatedItem = new CartItem({
        id: item.id,
        product: item.product,
        quantity: cantidad
      });

      // Update the array
      actuales[itemIndex] = updatedItem;
      this.items.next([...actuales]);
      this.saveCartToStorage();
      return true;
    }
    
    return false;
  }

  vaciarCarrito() {
    this.items.next([]);
    this.saveCartToStorage();
  }

  // Helper methods for cart statistics
  getTotalItems(): number {
    return this.items.value.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.items.value.reduce((total, item) => total + item.total, 0);
  }

  getTotalPriceFormatted(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.getTotalPrice());
  }

  getCustomizableItems(): CartItem[] {
    return this.items.value.filter(item => item.product.type === 'personalizable');
  }

  getPreEmbroideredItems(): CartItem[] {
    return this.items.value.filter(item => item.product.type === 'bordado');
  }

  // Get cart item by ID
  getCartItemById(cartItemId: string): CartItem | undefined {
    return this.items.value.find(i => i.id === cartItemId);
  }

  getCartItemQuantityForVariant(productId: number, color: string, size: string): number {
    const item = this.items.value.find(i =>
      i.product.type === 'bordado' &&
      i.product.id === productId &&
      i.product.variants[0]?.color === color &&
      i.product.variants[0]?.sizes[0]?.size === size
    );
    return item ? item.quantity : 0;
  }

  getAvailableStockForVariant(product: any): number {
    if (!product || !product.variants || product.variants.length === 0) {
      return 0;
    }

    const variant = product.variants[0];
    if (!variant.sizes || variant.sizes.length === 0) {
      return 0;
    }

    const size = variant.sizes[0];
    return size.stock || 0;
  }

  // New method to check if a customized product is already in cart
  isCustomizedProductInCart(customizedProduct: ProductCustomizable): boolean {
    return this.items.value.some(item =>
      item.product.type === 'personalizable' &&
      item.product.id === customizedProduct.id
    );
  }

  // Get cart item count
  getCartItemCount(): number {
    return this.items.value.length;
  }

  // Check if cart is empty
  isCartEmpty(): boolean {
    return this.items.value.length === 0;
  }

  // Clear cart from localStorage (useful for testing or admin purposes)
  clearCartFromStorage(): void {
    localStorage.removeItem(this.CART_STORAGE_KEY);
    this.items.next([]);
  }

  // Security method to validate cart before checkout
  validateCartForCheckout(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const cartItems = this.items.value;

    if (cartItems.length === 0) {
      errors.push('El carrito está vacío');
      return { valid: false, errors };
    }

    for (const item of cartItems) {
      if (!this.isValidCartItemStructure(item)) {
        errors.push(`Item ${item.id}: Estructura de datos inválida`);
      }

      if (!this.isValidProduct(item.product)) {
        errors.push(`Item ${item.id}: Datos de producto inválidos`);
      }

      if (!this.isValidQuantity(item.quantity)) {
        errors.push(`Item ${item.id}: Cantidad inválida`);
      }

      if (!this.isValidPrice(item)) {
        errors.push(`Item ${item.id}: Precio manipulado detectado`);
      }

      if (!this.isValidTotal(item)) {
        errors.push(`Item ${item.id}: Cálculo de total incorrecto`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

}