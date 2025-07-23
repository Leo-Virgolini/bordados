import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { PrimeNG } from 'primeng/config';
import { Divider } from 'primeng/divider';
import { FileRemoveEvent, FileSelectEvent, FileUpload, FileUploadEvent, FileUploadHandlerEvent, UploadEvent } from 'primeng/fileupload';
import { Image } from 'primeng/image';
import { ProgressBar } from 'primeng/progressbar';
import { SelectButton } from 'primeng/selectbutton';
import { Toast } from 'primeng/toast';
import { ToggleButton } from 'primeng/togglebutton';
import { Tooltip } from 'primeng/tooltip';
import { Panel } from 'primeng/panel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { es } from '../../es.json'
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
import { ProductSizeStock } from '../../models/product-variant';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent, ErrorHelperComponent, RouterLink,
    Button, FileUpload, Image, Badge, Toast, ProgressBar, SelectButton, Checkbox, ToggleButton, Tooltip, Divider, Panel, ConfirmDialog, Tag, Dialog, TableModule, InputNumber
  ],
  providers: [],
  templateUrl: './customize.component.html',
  styleUrl: './customize.component.scss'
})
export class CustomizeComponent implements OnInit {

  formulario!: FormGroup;
  imageURL: string | undefined;
  imageFile: File | undefined;
  invalidFileSizeMessageSummary: string = es.invalidFileSizeMessageSummary
  invalidFileSizeMessageDetail: string = es.invalidFileSizeMessageDetail;
  isLoading: boolean = false;
  showSizeGuide: boolean = false;
  isLoadingProducts: boolean = true;

  maxImageSize: number = 10485760; // 10 MB
  precioSegundoColor: number = 0;

  baseProducts: ProductCustomizable[] = [];
  availableTypes: { label: string, value: string, product: ProductCustomizable }[] = [];
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

  constructor(private config: PrimeNG, private messageService: MessageService, private fb: FormBuilder, private confirmationService: ConfirmationService,
    private carritoService: CarritoService, private router: Router, private hiladosService: HiladosService, private productsService: ProductsService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSecondColorPrice();
    this.loadThreadColors();
    this.productsService.getCustomizableProducts().subscribe(products => {
      this.baseProducts = products;
      this.availableTypes = products.map(product => ({
        label: this.capitalize(product.name),
        value: product.id, // Use product ID instead of garmentType to avoid deduplication
        product
      }));
      this.isLoadingProducts = false;
      this.updateAvailableQuantities();
    });
  }

  private initForm(): void {
    this.formulario = this.fb.group({
      tipo: [undefined, Validators.required],
      talle: [undefined, Validators.required],
      colorPrenda: [undefined, Validators.required],
      colorHilado1: [undefined, Validators.required],
      usarSegundoColor: [false],
      colorHilado2: [undefined],
      imagen: [undefined, Validators.required],
      cantidad: [1, Validators.required]
    });
  }

  loadSecondColorPrice() {
    this.hiladosService.getSecondColorPrice().subscribe({
      next: (price: number) => {
        this.precioSegundoColor = price;
      },
      error: (error: any) => {
        console.error('Error loading second color price:', error);
        // Keep the default value if there's an error
      }
    });
  }

  confirmar(): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        '<strong>Prenda:</strong> ' + this.availableTypes.find(p => p.value === this.formulario.get('tipo')?.value)?.label +
        '<br/><strong>Talle:</strong> ' + this.availableSizes.find(p => p.value === this.formulario.get('talle')?.value)?.label +
        '<br/><strong>Color de prenda:</strong> ' + this.availableColors.find(p => p.value === this.formulario.get('colorPrenda')?.value)?.label +
        '<br/><strong>Color del hilado:</strong> ' + this.coloresHilado.find(p => p.id === this.formulario.get('colorHilado1')?.value)?.name +
        (this.formulario.get('usarSegundoColor')?.value ? '<br/><strong>2° Color del hilado:</strong> ' + this.coloresHilado.find(p => p.id === this.formulario.get('colorHilado2')?.value)?.name : '') +
        '<br/><strong>Imagen:</strong> ' + this.imageFile?.name +
        '<br/><strong>Cantidad:</strong> ' + this.cantidades.find(p => p.value === this.formulario.get('cantidad')?.value)?.label
      ,
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-outlined p-button-danger',
      accept: () => {
        if (this.submitFormulario()) {
          this.isLoading = true;
          this.messageService.add({ severity: 'success', summary: 'El producto se ha agregado.', detail: 'Redirigiendo al carrito...', life: 3000, icon: 'pi pi-cart-plus' });
          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/carrito']);
          }, 3000);
        }
      }
    });
  }

  submitFormulario(): boolean {
    if (this.formulario.valid) {
      this.agregarAlCarrito();
      console.log('Formulario enviado', this.formulario.value);
      // Aquí va tu lógica de envío...
      return true;
    } else {
      this.formulario.markAllAsTouched();
      return false;
    }
  }

  onChange() {
    const usarSegundoColor: boolean = this.formulario.get('usarSegundoColor')?.value;
    const colorHilado2 = this.formulario.get('colorHilado2');

    if (usarSegundoColor) {
      colorHilado2?.setValidators(Validators.required);
      colorHilado2?.markAsDirty();
    } else {
      colorHilado2?.clearValidators();
      // colorHilado2?.setValue(undefined); // opcional: limpiar campo
      colorHilado2?.reset(); // Esto deselecciona el selectbutton
    }

    colorHilado2?.updateValueAndValidity();
    this.updateAvailableQuantities(); // Update quantities when form changes
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

  onSelect(event: any) {
    console.log("onSelect");
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
    if (usarSegundoColor) base += this.precioSegundoColor;
    return base;
  }

  calcularSubtotal(): number {
    const cantidad: number = this.formulario.get('cantidad')?.value || 1;

    return this.calcularPrecioUnitario() * cantidad;
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

  enviarPersonalizacion() {
  }

  agregarAlCarrito() {
    const datos = this.formulario.value;
    const threadColor1 = this.coloresHilado.find(p => p.id === this.formulario.get('colorHilado1')?.value);
    const threadColor2 = datos.usarSegundoColor ? this.coloresHilado.find(p => p.id === this.formulario.get('colorHilado2')?.value) : undefined;
    const selectedProductId = this.formulario.get('tipo')?.value;
    const selectedColor = this.formulario.get('colorPrenda')?.value;
    const selectedSize = this.formulario.get('talle')?.value;
    const baseProduct = this.baseProducts.find(p => p.id === selectedProductId);
    const variant = baseProduct?.variants.find(v => v.color === selectedColor);
    const image = variant?.image || this.imageURL;
    const productoCustomizable = new ProductCustomizable({
      id: crypto.randomUUID(),
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
      customImage: this.imageURL!
    });
    const nuevoItem = new CartItem({
      product: productoCustomizable,
      quantity: datos.cantidad
    });
    this.carritoService.agregarItem(nuevoItem);
  }

  openSizeGuide(): void {
    this.showSizeGuide = true;
  }

  closeSizeGuide(): void {
    this.showSizeGuide = false;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      this.updateAvailableQuantities();
    }
  }

  updateAvailableQuantities() {
    const selectedSize = this.formulario.get('talle')?.value;
    const selectedColor = this.formulario.get('colorPrenda')?.value;

    if (selectedSize && selectedColor && this.selectedVariant) {
      const sizeStock = this.selectedVariant.sizes.find((s: ProductSizeStock) => s.size === selectedSize);
      const maxStock = sizeStock?.stock || 0;

      // Generate quantities from 1 to maxStock (up to 10)
      const maxQuantity = Math.min(maxStock, 10);
      this.cantidades = Array.from({ length: maxQuantity }, (_, i) => ({
        label: (i + 1).toString(),
        value: i + 1
      }));

      // Reset quantity if current value exceeds max
      const currentQuantity = this.formulario.get('cantidad')?.value;
      if (currentQuantity > maxQuantity) {
        this.formulario.get('cantidad')?.setValue(1);
      }
    }
  }

  onTalleChange() {
    this.updateAvailableQuantities();
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

  getThreadColorCode(threadColorId: string): string {
    const threadColor = this.coloresHilado.find(color => color.id === threadColorId);
    return threadColor?.code || '#CCCCCC';
  }

  loadThreadColors() {
    this.hiladosService.getHilados().subscribe((colors: ThreadColor[]) => {
      this.coloresHilado = colors;
    });
  }

}
