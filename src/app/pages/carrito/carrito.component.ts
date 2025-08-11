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
import { ProductCustomizable } from '../../models/product-customizable';
import { ProductBase } from '../../models/product-base';

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
            id: [item.id],
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
      const success = this.carritoService.actualizarCantidad(item.id, cantidad);
      if (!success) {
        // If update failed due to stock validation, reset the input
        const itemIndex = this.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          setTimeout(() => {
            this.getCantidadControl(itemIndex).setValue(item.quantity);
            if (inputRef && inputRef.input.nativeElement) {
              inputRef.input.nativeElement.value = item.quantity;
            }
          }, 0);
        }
      }
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
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonProps: {
        severity: 'primary'
      },
      rejectButtonProps: {
        outlined: true,
      },
      accept: () => {
        this.carritoService.eliminarItem(cartItemId);
        this.messageService.add({ severity: 'error', summary: 'Eliminado', detail: 'Has eliminado el producto del carrito.', life: 3000, icon: 'pi pi-trash' });
      }
    });
  }

  onImageError(event: any, product: ProductBase): void {
    // Update the image source to show default image
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'sin_imagen.png';
      imgElement.alt = `${product.name}`;
    }
  }

  calcularTotal(): number {
    return this.carritoService.getTotalPrice();
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

  getProductImage(product: any): string | undefined {
    return product.variants?.[0]?.image || 'sin_imagen.png';
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

    const selectedVariant = product.variants[0];
    if (!selectedVariant.sizes || selectedVariant.sizes.length === 0) {
      return 1; // Default minimum
    }

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
    if (item.product.type === 'personalizable') {
      return (item.product as ProductCustomizable).customImage || 'sin_imagen.png';
    }
    return 'sin_imagen.png';
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