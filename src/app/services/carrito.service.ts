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
    const existente = actuales.find(i => i.id === item.id);
    if (existente) {
      existente.cantidad += item.cantidad;
      existente.subtotal = existente.precioUnitario * existente.cantidad;
    } else {
      actuales.push(item);
    }
    this.items.next([...actuales]);
  }

  eliminarItem(id: string) {
    const filtrados = this.items.value.filter(i => i.id !== id);
    this.items.next(filtrados);
  }

  actualizarCantidad(id: string, cantidad: number) {
    const actuales = this.items.value;
    const itemIndex = actuales.findIndex(i => i.id === id);
    
    if (itemIndex !== -1) {
      // Update only the specific item to minimize re-renders
      actuales[itemIndex] = {
        ...actuales[itemIndex],
        cantidad,
        subtotal: actuales[itemIndex].precioUnitario * cantidad
      };
      
      // Create a new array reference to trigger change detection
      this.items.next([...actuales]);
    }
  }

  vaciarCarrito() {
    this.items.next([]);
  }

  isSubmitting = false;

}