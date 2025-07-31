import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { ProductCustomizable } from '../models/product-customizable';

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private items: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  items$: Observable<CartItem[]> = this.items.asObservable();

  isSubmitting = false;

  getCarrito(): CartItem[] {
    return this.items.value;
  }

  agregarItem(item: CartItem) {
    const actuales = this.items.value;
    
    // For customized products, always add as new item (they're unique)
    if (item.product.type === 'personalizable') {
      actuales.push(item);
      this.items.next([...actuales]);
      return;
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
    } else {
      actuales.push(item);
      this.items.next([...actuales]);
    }
  }

  eliminarItem(cartItemId: string) {
    const filtrados = this.items.value.filter(i => i.id !== cartItemId);
    this.items.next(filtrados);
  }

  actualizarCantidad(cartItemId: string, cantidad: number) {
    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.id === cartItemId);

    if (itemIndex !== -1) {
      const item = actuales[itemIndex];
      // Create a new CartItem with updated quantity
      const updatedItem = new CartItem({
        id: item.id,
        product: item.product,
        quantity: cantidad
      });

      // Update the array
      actuales[itemIndex] = updatedItem;
      this.items.next([...actuales]);
    }
  }

  // Legacy method for backward compatibility - now uses CartItem ID
  actualizarCantidadPorVariant(productId: number, color: string, size: string, cantidad: number) {
    const actuales = this.items.value;
    const item = actuales.find(i =>
      i.product.type === 'bordado' &&
      i.product.id === productId &&
      i.product.variants[0]?.color === color &&
      i.product.variants[0]?.sizes[0]?.size === size
    );

    if (item) {
      this.actualizarCantidad(item.id, cantidad);
    }
  }

  vaciarCarrito() {
    this.items.next([]);
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

  // Legacy methods for backward compatibility
  getCartItemQuantity(productId: number): number {
    const item = this.items.value.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
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

}