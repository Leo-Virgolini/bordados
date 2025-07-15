import { Component, ViewChildren, QueryList, ElementRef, OnInit } from '@angular/core';
import { CarritoItem } from '../../model/carrito-item';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Panel } from 'primeng/panel';
import { CarritoService } from '../../services/carrito.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Image } from 'primeng/image';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    Panel, Button, InputNumber, Card, Divider, Toast, ConfirmDialog, Tag, Image],
  providers: [MessageService, ConfirmationService],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit {

  items: CarritoItem[] = [];
  form!: FormGroup;

  constructor(private carritoService: CarritoService, private fb: FormBuilder, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.carritoService.items$.subscribe((items: CarritoItem[]) => {
      this.items = items;
      this.initializeForm();
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      items: this.fb.array(
        this.items.map(item =>
          this.fb.group({
            id: [item.producto.id],
            cantidad: [item.cantidad, [Validators.required, Validators.min(1)]]
          })
        )
      )
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getCantidadControl(index: number): FormControl {
    return this.itemsFormArray.at(index).get('cantidad') as FormControl;
  }

  actualizarCantidad(item: CarritoItem, nuevaCantidad: number | string, inputRef: any) {

    const cantidad: number = typeof nuevaCantidad === 'string' ? parseInt(nuevaCantidad) : nuevaCantidad;

    // Check if quantity is valid
    if (cantidad && cantidad > 0 && cantidad <= 100) {
      this.carritoService.actualizarCantidad(item.producto.id, cantidad);
    } else if (cantidad > 100) {
      // If quantity exceeds 100, reset the input to the previous item quantity
      const itemIndex = this.items.findIndex(i => i.producto.id === item.producto.id);
      if (itemIndex !== -1) {
        // Use the original item quantity before any changes
        setTimeout(() => {
          this.getCantidadControl(itemIndex).setValue(item.cantidad);
          // Also update the input component directly
          if (inputRef && inputRef.input.nativeElement) {
            inputRef.input.nativeElement.value = item.cantidad;
          }
        }, 0);
      }
    }
  }

  eliminar(id: string): void {
    this.confirmationService.confirm({
      header: 'Eliminar producto',
      message: '¿Estás seguro de querer eliminar este producto del carrito?',
      icon: 'pi pi-exclamation-circle',
      rejectButtonProps: {
        label: 'Cancelar',
        icon: 'pi pi-times',
        outlined: true,
        size: 'small',
        severity: 'danger'
      },
      acceptButtonProps: {
        label: 'Confirmar',
        icon: 'pi pi-check',
        size: 'small',
        severity: 'primary'
      },
      accept: () => {
        this.carritoService.eliminarItem(id);
        this.messageService.add({ severity: 'error', summary: 'Eliminado', detail: 'Has eliminado el producto del carrito.', life: 3000, icon: 'pi pi-trash' });
      }
    });
  }

  calcularTotal(): number {
    return this.items.reduce((total, item) => total + item.total, 0);
  }

  isShippingFree(): boolean {
    return this.calcularTotal() >= 100000;
  }

  getShippingText(): string {
    return this.isShippingFree() ? 'Gratis' : 'A calcular';
  }

  getShippingIcon(): string {
    return this.isShippingFree() ? 'pi pi-check' : 'pi pi-calculator';
  }

  getShippingSeverity(): string {
    return this.isShippingFree() ? 'success' : 'info';
  }

  pagar() {
    alert('Implementar proceso de pago');
  }

  hasProp(obj: any, prop: string): boolean {
    return obj && Object.prototype.hasOwnProperty.call(obj, prop);
  }

}
