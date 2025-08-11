import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly CART_STORAGE_KEY = 'bordados_cart';
  private items = new BehaviorSubject<CartItem[]>([]);
  items$ = this.items.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  getCarrito(): CartItem[] {
    return this.items.value;
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        if (Array.isArray(items)) {
          // Convert plain objects to CartItem instances
          const cartItems = items.map(item => new CartItem(item));
          this.items.next(cartItems);
        }
      }
    } catch (error) {
      this.items.next([]);
      localStorage.removeItem(this.CART_STORAGE_KEY);
    }
  }

  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.items.value));
    } catch (error) {
      // If save fails, continue silently
    }
  }

  agregarItem(item: CartItem): boolean {
    if (!this.validateItem(item)) return false;

    const actuales = this.items.value;

    // For customized products, always add as new item
    if (item.product.type === 'personalizable') {
      actuales.push(item);
      this.items.next([...actuales]);
      this.saveCartToStorage();
      return true;
    }

    // For regular products, check if same variant exists
    const existente = actuales.find(i =>
      i.product.type === 'bordado' &&
      String(i.product.id) === String(item.product.id) &&
      i.product.variants?.[0]?.color === item.product.variants?.[0]?.color &&
      i.product.variants?.[0]?.sizes?.[0]?.size === item.product.variants?.[0]?.sizes?.[0]?.size
    );

    if (existente) {
      const newQuantity = existente.quantity + item.quantity;
      return this.actualizarCantidad(existente.id, newQuantity);
    }

    // Add as new item
    actuales.push(item);
    this.items.next([...actuales]);
    this.saveCartToStorage();
    return true;
  }

  private validateItem(item: CartItem): boolean {
    if (!item?.product?.id || !item.quantity || item.quantity <= 0) {
      return false;
    }

    // Validate stock for embroidered products
    if (item.product.type === 'bordado') {
      const variant = item.product.variants?.[0];
      const size = variant?.sizes?.[0];
      if (!variant || !size) return false;

      // Get current quantity in cart for this variant
      const currentInCart = this.getCurrentQuantityForVariant(
        item.product.id,
        variant.color,
        size.size
      );

      // Check if adding this quantity would exceed stock
      if (currentInCart + item.quantity > (size.stock || 0)) {
        return false;
      }
    }

    return true;
  }

  getCurrentQuantityForVariant(productId: number, color: string, size: string): number {
    const item = this.items.value.find(i =>
      i.product.type === 'bordado' &&
      String(i.product.id) === String(productId) &&
      i.product.variants?.[0]?.color === color &&
      i.product.variants?.[0]?.sizes?.[0]?.size === size
    );
    return item?.quantity || 0;
  }

  actualizarCantidad(itemId: string, cantidad: number): boolean {
    if (!cantidad || cantidad <= 0) return false;

    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = actuales[itemIndex];

    // Validate stock for embroidered products
    if (item.product.type === 'bordado') {
      const stock = item.product.variants?.[0]?.sizes?.[0]?.stock || 0;
      if (cantidad > stock) return false;
    }

    actuales[itemIndex] = new CartItem({
      ...item,
      quantity: cantidad
    });

    this.items.next([...actuales]);
    this.saveCartToStorage();
    return true;
  }

  eliminarItem(itemId: string): void {
    const actuales = this.items.value;
    const filtrados = actuales.filter(i => i.id !== itemId);
    this.items.next(filtrados);
    this.saveCartToStorage();
  }

  vaciarCarrito(): void {
    this.items.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  getCartItemCount(): number {
    return this.items.value.length;
  }

  isCartEmpty(): boolean {
    return this.items.value.length === 0;
  }

  getTotalItems(): number {
    return this.items.value.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.items.value.reduce((total, item) => total + item.total, 0);
  }

  getTotalPriceFormatted(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(this.getTotalPrice());
  }

}