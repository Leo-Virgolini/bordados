import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CarritoItem } from '../model/carrito-item';

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private items: BehaviorSubject<CarritoItem[]> = new BehaviorSubject<CarritoItem[]>([]);
  items$: Observable<CarritoItem[]> = this.items.asObservable();

  getCarrito(): CarritoItem[] {
    return this.items.value;
  }

  agregarItem(item: CarritoItem) {
    const actuales = this.items.value;
    const existente = actuales.find(i => i.producto.id === item.producto.id);
    if (existente) {
      // Update existing item quantity
      this.actualizarCantidad(item.producto.id, existente.cantidad + item.cantidad);
    } else {
      actuales.push(item);
      this.items.next([...actuales]);
    }
  }

  eliminarItem(id: string) {
    const filtrados = this.items.value.filter(i => i.producto.id !== id);
    this.items.next(filtrados);
  }

  actualizarCantidad(id: string, cantidad: number) {
    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.producto.id === id);

    if (itemIndex !== -1) {
      const item = actuales[itemIndex];
      // Create a new CarritoItem with updated quantity
      const updatedItem = new CarritoItem({
        producto: item.producto,
        cantidad
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
    return this.items.value.reduce((total, item) => total + item.cantidad, 0);
  }

  getTotalPrice(): number {
    return this.items.value.reduce((total, item) => total + item.total, 0);
  }

  getTotalPriceFormatted(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.getTotalPrice());
  }

  getCustomizableItems(): CarritoItem[] {
    return this.items.value.filter(item => item.producto.tipo === 'customizable');
  }

  getPreEmbroideredItems(): CarritoItem[] {
    return this.items.value.filter(item => item.producto.tipo === 'bordado');
  }

  isSubmitting = false;

}