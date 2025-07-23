import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../model/cart-item';

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
    // Check if the same variant (color/size) already exists in cart
    const existente = actuales.find(i =>
      i.product.id === item.product.id &&
      i.product.variants[0]?.color === item.product.variants[0]?.color &&
      i.product.variants[0]?.sizes[0]?.size === item.product.variants[0]?.sizes[0]?.size
    );

    if (existente) {
      // Update existing item quantity using variant-specific method
      const newQuantity = existente.quantity + item.quantity;
      this.actualizarCantidadPorVariant(
        item.product.id,
        item.product.variants[0]?.color || '',
        item.product.variants[0]?.sizes[0]?.size || '',
        newQuantity
      );
    } else {
      actuales.push(item);
      this.items.next([...actuales]);
    }
  }

  eliminarItem(id: string) {
    const filtrados = this.items.value.filter(i => i.product.id !== id);
    this.items.next(filtrados);
  }

  actualizarCantidad(id: string, cantidad: number) {
    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.product.id === id);

    if (itemIndex !== -1) {
      const item = actuales[itemIndex];
      // Create a new CartItem with updated quantity
      const updatedItem = new CartItem({
        product: item.product,
        quantity: cantidad
      });

      // Update the array
      actuales[itemIndex] = updatedItem;
      this.items.next([...actuales]);
    }
  }

  actualizarCantidadPorVariant(productId: string, color: string, size: string, cantidad: number) {
    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i =>
      i.product.id === productId &&
      i.product.variants[0]?.color === color &&
      i.product.variants[0]?.sizes[0]?.size === size
    );

    if (itemIndex !== -1) {
      const item = actuales[itemIndex];
      // Create a new CartItem with updated quantity
      const updatedItem = new CartItem({
        product: item.product,
        quantity: cantidad
      });

      // Update the array
      actuales[itemIndex] = updatedItem;
      this.items.next([...actuales]);
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

  getCartItemQuantity(productId: string): number {
    const item = this.items.value.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  getCartItemQuantityForVariant(productId: string, color: string, size: string): number {
    const item = this.items.value.find(i =>
      i.product.id === productId &&
      i.product.variants[0]?.color === color &&
      i.product.variants[0]?.sizes[0]?.size === size
    );
    return item ? item.quantity : 0;
  }

}