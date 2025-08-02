import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { Divider } from 'primeng/divider';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { Image } from 'primeng/image';
import { SelectButton } from 'primeng/selectbutton';
import { Toast } from 'primeng/toast';
import { ToggleButton } from 'primeng/togglebutton';
import { Tooltip } from 'primeng/tooltip';
import { Panel } from 'primeng/panel';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../models/cart-item';
import { ThreadColor } from '../../models/thread-color';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { Tag } from 'primeng/tag';
import { ProductCustomizable } from '../../models/product-customizable';
import { RouterLink } from '@angular/router';
import { HiladosService } from '../../services/hilados.service';
import { ProductsService } from '../../services/products.service';
import { ProductSizeStock, ProductVariant } from '../../models/product-base';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { AppSettings, SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent, ErrorHelperComponent, RouterLink,
    Button, FileUpload, Image, Badge, Toast, SelectButton, ToggleButton, Tooltip, Divider, Panel,
    Tag, Dialog, TableModule, InputNumber, InputText, InputGroup, InputGroupAddon
  ],
  providers: [],
  templateUrl: './customize.component.html',
  styleUrl: './customize.component.scss'
})
export class CustomizeComponent implements OnInit {

  formulario!: FormGroup;
  imageURL: string | undefined;
  imageFile: File | undefined;
  // invalidFileSizeMessageSummary: string = es.invalidFileSizeMessageSummary
  // invalidFileSizeMessageDetail: string = es.invalidFileSizeMessageDetail;
  isLoading: boolean = false;
  showSizeGuide: boolean = false;
  isLoadingProducts: boolean = true;
  showConfirmationDialog: boolean = false;

  maxImageSize: number = 0;
  precioSegundoColor: number = 0;
  precioTextoPersonalizado: number = 0;
  maxTextLength: number = 0;

  baseProducts: ProductCustomizable[] = [];
  availableTypes: { label: string, value: number, product: ProductCustomizable }[] = [];
  availableColors: { label: string, value: string, image?: string }[] = [];
  availableSizes: { label: string, value: string }[] = [];
  selectedBaseProduct?: ProductCustomizable;
  selectedVariant?: any;

  coloresHilado: ThreadColor[] = [];
  cantidades: { label: string, value: number }[] = [];

  // Size guide data similar to MercadoLibre
  sizeGuide = {
    title: 'Guía de Talles',
    description: 'Medí tu prenda favorita y compará con nuestra tabla de talles',
    instructions: [
      '1. Tomá una prenda que te quede bien',
      '2. Medí el ancho del pecho (de costura a costura)',
      '3. Medí el largo total (desde el hombro hasta el final)',
      '4. Compará con nuestra tabla'
    ],
    measurements: [
      { size: 'XS', chest: '44-46 cm', length: '62-64 cm', fit: 'Ajustado' },
      { size: 'S', chest: '46-48 cm', length: '64-66 cm', fit: 'Regular' },
      { size: 'M', chest: '48-50 cm', length: '66-68 cm', fit: 'Regular' },
      { size: 'L', chest: '50-52 cm', length: '68-70 cm', fit: 'Regular' },
      { size: 'XL', chest: '52-54 cm', length: '70-72 cm', fit: 'Holgado' },
      { size: 'XXL', chest: '54-56 cm', length: '72-74 cm', fit: 'Holgado' }
    ]
  };

  constructor(private config: PrimeNG, private messageService: MessageService, private fb: FormBuilder,
    private carritoService: CarritoService, private router: Router, private hiladosService: HiladosService, private settingsService: SettingsService, private productsService: ProductsService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
    this.loadThreadColors();
    this.productsService.getCustomizableProducts().subscribe(products => {
      this.baseProducts = products;
      this.availableTypes = products.map(product => ({
        label: this.capitalize(product.name),
        value: product.id, // Use product ID instead of garmentType to avoid deduplication
        product
      }));
      this.isLoadingProducts = false;
      // this.updateAvailableQuantities();
    });
  }

  private initForm(): void {
    this.formulario = this.fb.group({
      tipo: [undefined, Validators.required],
      talle: [undefined, Validators.required],
      colorPrenda: [undefined, Validators.required],
      colorHilado1: [undefined, Validators.required],
      usarSegundoColor: [false],
      colorHilado2: [undefined], // No initial validators - will be added dynamically
      usarTextoPersonalizado: [false],
      textoPersonalizado: [undefined], // No initial validators - will be added dynamically
      colorTextoPersonalizado: [undefined], // No initial validators - will be added dynamically
      imagen: [undefined, Validators.required],
      cantidad: [1, Validators.required]
    });
  }

  loadThreadColors() {
    this.hiladosService.getHilados().subscribe((colors: ThreadColor[]) => {
      this.coloresHilado = colors;
    });
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings: AppSettings) => {
        this.precioSegundoColor = settings.secondColorPrice;
        this.precioTextoPersonalizado = settings.customTextPrice;
        this.maxImageSize = settings.maxImageSize;
        this.maxTextLength = settings.maxTextLength;
      },
      error: (error: any) => {
        console.error('Error loading settings:', error);
        // Keep the default values if there's an error
      }
    });
  }

  confirmar(): void {
    this.showConfirmationDialog = true;
  }

  confirmOrder(): void {
    if (this.submitFormulario()) {
      this.isLoading = true;
      this.showConfirmationDialog = false;
      this.messageService.add({ severity: 'success', summary: '¡Producto agregado!', detail: 'El producto se ha agregado al carrito. Redirigiendo...', life: 3000, icon: 'pi pi-cart-plus' });
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/carrito']);
      }, 3000);
    }
  }

  submitFormulario(): boolean {
    if (this.formulario.valid) {
      this.agregarAlCarrito();
      return true;
    } else {
      this.formulario.markAllAsTouched();
      return false;
    }
  }

  eliminarImagen(event: any, removeFileCallback: any) {
    removeFileCallback(event, 0);
    this.imageFile = undefined;
    this.imageURL = undefined;
    this.formulario.get('imagen')?.setValue(undefined);
    this.formulario.get('imagen')?.markAsTouched();
    this.formulario.get('imagen')?.updateValueAndValidity();
    this.messageService.add({ severity: 'error', summary: 'Imagen eliminada', detail: 'Has eliminado la imagen.', life: 2000, icon: 'pi pi-trash' });
  }

  elegirImagen(event: any, callback: any) {
    callback();
  }

  onImageSelect(event: any) {
    console.log("onImageSelect");
    this.imageFile = undefined;
    this.imageURL = undefined;

    const file: File = (event.files)?.[0];

    if (file) {
      if (file.size > this.maxImageSize) {
        this.formulario.get('imagen')?.markAsDirty();
        this.formulario.get('imagen')?.markAsTouched();
        this.formulario.get('imagen')?.updateValueAndValidity();
        this.formulario.get('imagen')?.setValue(undefined);
        this.formulario.get('imagen')?.setErrors({ 'fileSize': true });
      } else {
        this.imageFile = file;
        console.log(this.imageFile);

        const imageSize = this.imageFile.size;
        console.log(imageSize);

        // Use FileReader for better security and memory management
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageURL = e.target.result; // Data URL
        };
        reader.readAsDataURL(this.imageFile);

        this.formulario.get('imagen')?.setErrors(null);
        this.formulario.get('imagen')?.markAsDirty();
        this.formulario.get('imagen')?.markAsTouched();
        this.formulario.get('imagen')?.updateValueAndValidity();
        this.formulario.get('imagen')?.setValue(this.imageFile);
      }
    }
  }

  onUpload(event: FileUploadHandlerEvent) {
    console.log("onUpload");
    // Si querés enviar la imagen al backend:
    // const formData = new FormData();
    // formData.append('imagen', file);
    // this.http.post('URL_BACKEND', formData).subscribe(...);

    this.messageService.add({ severity: 'info', summary: 'Imagen subida', detail: '' });
  }

  formatSize(bytes: number | undefined) {
    const k = 1024;
    const dm = 2;
    const sizes = this.config.translation.fileSizeTypes;
    if (bytes === 0 && sizes) {
      return `0 ${sizes[0]}`;
    }

    if (bytes) {
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

      return `${formattedSize} ${sizes![i]}`;
    }
    return '';
  }

  getLabel(controlName: string, options: any[]): string {
    const value: string | undefined = this.formulario.get(controlName)?.value;

    // Handle ThreadColor objects
    if (options.length > 0 && 'name' in options[0]) {
      const option = options.find(opt => opt.id === value);
      return option?.name || '';
    }

    // Handle regular objects with label/value
    const option: { label: string, value: string } | undefined = options.find(opt => opt.value === value);
    return option?.label || '';
  }

  getPrecio(controlName: string, options: any[]): number {
    if (controlName === 'tipo') {
      // For product type, get price from the product object
      const selectedOption = options.find(opt => opt.value === this.formulario.get(controlName)?.value);
      return selectedOption?.product?.price || 0;
    }
    return 0;
  }

  calcularPrecioUnitario(): number {
    let base: number = this.getSelectedPrice();
    const usarSegundoColor: boolean = this.formulario.get('usarSegundoColor')?.value;
    const usarTextoPersonalizado: boolean = this.formulario.get('usarTextoPersonalizado')?.value;

    if (usarSegundoColor) base += this.precioSegundoColor;
    if (usarTextoPersonalizado) base += this.precioTextoPersonalizado;

    return base;
  }

  calcularSubtotal(): number {
    const cantidad: number = this.formulario.get('cantidad')?.value || 1;

    return this.calcularPrecioUnitario() * cantidad;
  }

  onTipoPrendaChange() {
    const productId = this.formulario.get('tipo')?.value;
    this.selectedBaseProduct = this.baseProducts.find(p => p.id === productId);
    this.availableColors = this.selectedBaseProduct?.variants.map(v => ({
      label: v.color,
      value: v.color,
      image: v.image
    })) || [];
    this.formulario.get('colorPrenda')?.reset();
    // Show all available sizes for the selected type (across all variants, unique, with stock)
    const sizeSet = new Set<string>();
    (this.selectedBaseProduct?.variants || []).forEach(variant => {
      (variant.sizes || []).forEach(sizeStock => {
        if (sizeStock.stock > 0) {
          sizeSet.add(sizeStock.size);
        }
      });
    });
    // Order sizes from smallest to largest
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    this.availableSizes = Array.from(sizeSet)
      .sort((a, b) => {
        const idxA = sizeOrder.indexOf(a);
        const idxB = sizeOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
      .map(size => ({ label: size, value: size }));
    this.formulario.get('talle')?.reset();
  }

  onColorPrendaChange() {
    const color = this.formulario.get('colorPrenda')?.value;
    if (color && this.selectedBaseProduct) {
      this.selectedVariant = this.selectedBaseProduct.variants.find(v => v.color === color);
      this.availableSizes = (this.selectedVariant?.sizes || [])
        .filter((s: ProductSizeStock) => s.stock > 0)
        .sort((a: ProductSizeStock, b: ProductSizeStock) => {
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const idxA = sizeOrder.indexOf(a.size);
          const idxB = sizeOrder.indexOf(b.size);
          if (idxA === -1 && idxB === -1) return a.size.localeCompare(b.size);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        })
        .map((s: ProductSizeStock) => ({ label: s.size, value: s.size }));
      this.formulario.get('talle')?.reset();
      this.resetCantidad();
    }
  }

  onTalleChange() {
    this.resetCantidad();
  }

  resetCantidad() {
    this.formulario.get('cantidad')?.setValue(1);
  }

  onUsarSegundoColorChange() {
    const usarSegundoColor = this.formulario.get('usarSegundoColor')?.value;
    const colorHilado2Control = this.formulario.get('colorHilado2');

    if (usarSegundoColor) {
      // Add required validation when toggle is turned on
      colorHilado2Control?.setValidators([Validators.required]);
    } else {
      // Remove required validation and reset when toggle is turned off
      colorHilado2Control?.clearValidators();
      colorHilado2Control?.reset();
      colorHilado2Control?.markAsUntouched();
    }

    // Update validation state
    colorHilado2Control?.updateValueAndValidity();
  }

  onUsarTextoPersonalizadoChange() {
    const usarTextoPersonalizado = this.formulario.get('usarTextoPersonalizado')?.value;
    const textoPersonalizadoControl = this.formulario.get('textoPersonalizado');
    const colorTextoPersonalizadoControl = this.formulario.get('colorTextoPersonalizado');

    if (usarTextoPersonalizado) {
      // Add required validation when toggle is turned on
      textoPersonalizadoControl?.setValidators([Validators.required, Validators.maxLength(this.maxTextLength)]);
      colorTextoPersonalizadoControl?.setValidators([Validators.required]);
    } else {
      // Remove required validation and reset when toggle is turned off
      textoPersonalizadoControl?.clearValidators();
      textoPersonalizadoControl?.reset();
      textoPersonalizadoControl?.markAsUntouched();

      colorTextoPersonalizadoControl?.clearValidators();
      colorTextoPersonalizadoControl?.reset();
      colorTextoPersonalizadoControl?.markAsUntouched();
    }

    // Update validation state
    textoPersonalizadoControl?.updateValueAndValidity();
    colorTextoPersonalizadoControl?.updateValueAndValidity();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getSelectedPrice(): number {
    return this.selectedBaseProduct?.price || 0;
  }

  getSelectedImage(): string | undefined {
    return this.selectedVariant?.image;
  }

  getColorValue(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'Blanco': '#F5F5F5',
      'Negro': '#212121',
      'Gris': '#9E9E9E',
      'Azul': '#1565C0',
      'Verde': '#388E3C',
      'Rojo': '#C62828'
    };
    return colorMap[colorName] || '#CCCCCC'; // Default gray if color not found
  }

  getThreadColorCode(threadColorId: number): string {
    const threadColor = this.coloresHilado.find(color => color.id === threadColorId);
    return threadColor?.code || '#CCCCCC';
  }

  getCurrentStock(): number {
    const selectedColor = this.formulario.get('colorPrenda')?.value;
    const selectedSize = this.formulario.get('talle')?.value;
    if (selectedColor && selectedSize && this.selectedBaseProduct) {
      const variant = this.selectedBaseProduct.variants.find(v => v.color === selectedColor);
      const sizeStock = variant?.sizes.find(s => s.size === selectedSize);
      return sizeStock?.stock ?? 0;
    }
    return 0;
  }

  openSizeGuide(): void {
    this.showSizeGuide = true;
  }

  closeSizeGuide(): void {
    this.showSizeGuide = false;
  }

  agregarAlCarrito() {
    const datos = this.formulario.value;
    const threadColor1: ThreadColor | undefined = this.coloresHilado.find(p => p.id === datos.colorHilado1);
    const threadColor2: ThreadColor | undefined = datos.usarSegundoColor ? this.coloresHilado.find(p => p.id === datos.colorHilado2) : undefined;
    const customTextColor: ThreadColor | undefined = datos.usarTextoPersonalizado ? this.coloresHilado.find(p => p.id === datos.colorTextoPersonalizado) : undefined;
    const selectedProductTypeId: number = datos.tipo;
    const selectedColor: string = datos.colorPrenda;
    const selectedSize: string = datos.talle;
    const baseProduct: ProductCustomizable | undefined = this.baseProducts.find(p => p.id === selectedProductTypeId);
    const variant: ProductVariant | undefined = baseProduct?.variants.find(v => v.color === selectedColor);
    const image = variant?.image || this.imageURL;

    const productoCustomizable = new ProductCustomizable({
      name: baseProduct?.name || 'Producto Personalizable',
      description: baseProduct?.description || 'Producto personalizable',
      garmentType: baseProduct?.garmentType || 'remera',
      price: this.calcularPrecioUnitario(),
      type: 'personalizable',
      variants: [
        {
          color: selectedColor,
          image: image,
          sizes: [
            { size: selectedSize, stock: variant?.sizes.find(s => s.size === selectedSize)?.stock ?? 1 }
          ]
        }
      ],
      threadColor1: threadColor1!,
      threadColor2: threadColor2,
      customImage: this.imageURL!,
      customText: datos.usarTextoPersonalizado ? datos.textoPersonalizado : undefined,
      customTextColor: customTextColor
    });

    const nuevoItem = new CartItem({
      product: productoCustomizable,
      quantity: datos.cantidad
    });

    this.carritoService.agregarItem(nuevoItem);
  }

}
