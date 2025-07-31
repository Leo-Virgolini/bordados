import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../models/cart-item';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Panel } from 'primeng/panel';
import { CarritoService } from '../../services/carrito.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
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
  providers: [],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit {

  items: CartItem[] = [];
  form!: FormGroup;
  freeShippingThreshold: number = 50000; // Default value, will be loaded from service

  constructor(
    private carritoService: CarritoService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.carritoService.items$.subscribe((items: CartItem[]) => {
      this.items = items;
      this.initializeForm();
    });
    this.loadSettings();
  }

  initializeForm() {
    this.form = this.fb.group({
      items: this.fb.array(
        this.items.map(item =>
          this.fb.group({
            id: [item.product.id],
            cantidad: [item.quantity, [Validators.required, Validators.min(1)]]
          })
        )
      )
    });
  }

  private loadSettings(): void {
    this.settingsService.getFreeShippingThreshold().subscribe(threshold => {
      this.freeShippingThreshold = threshold;
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getCantidadControl(index: number): FormControl {
    return this.itemsFormArray.at(index).get('cantidad') as FormControl;
  }

  actualizarCantidad(item: CartItem, nuevaCantidad: number | string, inputRef: any) {

    const cantidad: number = typeof nuevaCantidad === 'string' ? parseInt(nuevaCantidad) : nuevaCantidad;
    const maxStock = this.getMaxStock(item.product);

    // Check if quantity is valid
    if (cantidad && cantidad > 0 && cantidad <= maxStock) {
      this.carritoService.actualizarCantidad(item.id, cantidad);
    } else if (cantidad > maxStock) {
      // If quantity exceeds max stock, reset the input to the previous item quantity
      const itemIndex = this.items.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        // Use the original item quantity before any changes
        setTimeout(() => {
          this.getCantidadControl(itemIndex).setValue(item.quantity);
          // Also update the input component directly
          if (inputRef && inputRef.input.nativeElement) {
            inputRef.input.nativeElement.value = item.quantity;
          }
        }, 0);
      }
    }
  }

  eliminar(cartItemId: string): void {
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
        this.carritoService.eliminarItem(cartItemId);
        this.messageService.add({ severity: 'error', summary: 'Eliminado', detail: 'Has eliminado el producto del carrito.', life: 3000, icon: 'pi pi-trash' });
      }
    });
  }

  calcularTotal(): number {
    return this.items.reduce((total, item) => total + item.total, 0);
  }

  calcularTotalOriginal(): number {
    return this.items.reduce((total, item) => total + item.originalTotal, 0);
  }

  calcularAhorroTotal(): number {
    return this.items.reduce((total, item) => total + item.discountAmount, 0);
  }

  tieneDescuentos(): boolean {
    return this.items.some(item => item.hasDiscount);
  }

  isShippingFree(): boolean {
    return this.calcularTotal() >= this.freeShippingThreshold;
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

  getThreadColorName(product: any, colorNumber: number): string {
    if (product.type === 'personalizable') {
      if (colorNumber === 1) {
        return product.threadColor1?.name || '-';
      } else if (colorNumber === 2) {
        return product.threadColor2?.name || '-';
      }
    }
    return '-';
  }

  hasSecondThreadColor(product: any): boolean {
    return product.type === 'personalizable' && !!product.threadColor2;
  }

  // For cart items from customize flow, product.variants contains only the selected variant and size
  getProductImage(product: any): string | undefined {
    return product.variants?.[0]?.image;
  }

  getProductColor(product: any): string | undefined {
    return product.variants?.[0]?.color;
  }

  getProductSize(product: any): string | undefined {
    return product.variants?.[0]?.sizes?.[0]?.size;
  }

  getMaxStock(product: any): number {
    if (!product.variants || product.variants.length === 0) {
      return 1; // Default minimum
    }

    // Get the selected variant (color)
    const selectedVariant = product.variants[0];
    if (!selectedVariant.sizes || selectedVariant.sizes.length === 0) {
      return 1; // Default minimum
    }

    // Get the selected size stock
    const selectedSize = this.getProductSize(product);

    // If we have a specific size, get its stock
    if (selectedSize && selectedSize !== '-') {
      const sizeStock = selectedVariant.sizes.find((sizeStock: any) => sizeStock.size === selectedSize);
      if (sizeStock) {
        return sizeStock.stock;
      }
    }

    // Fallback: return the maximum stock across all sizes of this variant
    let maxStock = 0;
    selectedVariant.sizes.forEach((sizeStock: any) => {
      if (sizeStock.stock > maxStock) {
        maxStock = sizeStock.stock;
      }
    });

    return maxStock > 0 ? maxStock : 1; // Return at least 1
  }

  getCustomImage(item: CartItem): string {
    return (item.product as any).customImage || '';
  }

  hasCustomText(product: any): boolean {
    return product.type === 'personalizable' && !!product.customText;
  }

  getCustomText(product: any): string {
    return product.type === 'personalizable' ? product.customText || '' : '';
  }

  getCustomTextColorName(product: any): string {
    return product.type === 'personalizable' && product.customTextColor ? product.customTextColor.name || '-' : '-';
  }

}
