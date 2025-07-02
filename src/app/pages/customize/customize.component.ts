import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
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
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { es } from '../../es.json'
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../model/carrito-item';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent,
    Button, FileUpload, Image, Badge, Toast, ProgressBar, SelectButton, Checkbox, ToggleButton, Tooltip, Divider, Panel, ConfirmDialog, ErrorHelperComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './customize.component.html',
  styleUrl: './customize.component.scss'
})
export class CustomizeComponent {

  formulario: FormGroup;
  imageURL: string | undefined;
  imageFile: File | undefined;
  invalidFileSizeMessageSummary: string = es.invalidFileSizeMessageSummary
  invalidFileSizeMessageDetail: string = es.invalidFileSizeMessageDetail;
  isSubmitting: boolean = false;
  isLoading: boolean = false;

  maxImageSize: number = 10485760; // 10 MB
  totalSizePercent: number = 0;

  precioSegundoColor: number = 1500;

  tiposPrenda = [
    { label: 'Remera', value: 'remera', precio: 700, image: 'remera_blanca' },
    { label: 'Remera Oversize', value: 'remera oversize', precio: 800, image: 'remera_oversize_negra' },
    { label: 'Buzo de Frisa Cuello Redondo', value: 'buzo cuello', precio: 1000, image: 'buzo_frisa_negro' },
    { label: 'Buzo con Capucha', value: 'buzo capucha', precio: 1200, image: 'buzo_capucha_negro' },
    { label: 'Buzo de Frisa Oversize', value: 'buzo oversize', precio: 1500, image: 'buzo_oversize_negro' }
  ];

  talles = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' }
  ];

  coloresPrendas = [
    { label: 'Rojo', value: 'rojo', hex: '#C62828' },
    { label: 'Verde', value: 'verde', hex: '#388E3C' },
    { label: 'Blanco', value: 'blanco', hex: '#F5F5F5' },
    { label: 'Negro', value: 'negro', hex: '#212121' },
    { label: 'Azul', value: 'azul', hex: '#1565C0' },
    { label: 'Gris', value: 'gris', hex: '#9E9E9E' }
  ];

  coloresHilado = [
    { label: 'Rojo', value: 'rojo', hex: '#C62828' },
    { label: 'Verde', value: 'verde', hex: '#388E3C' },
    { label: 'Blanco', value: 'blanco', hex: '#F5F5F5' },
    { label: 'Negro', value: 'negro', hex: '#212121' },
    { label: 'Azul', value: 'azul', hex: '#1565C0' },
    { label: 'Gris', value: 'gris', hex: '#9E9E9E' }
  ]

  cantidades = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 }
  ];

  constructor(private config: PrimeNG, private messageService: MessageService, private fb: FormBuilder, private confirmationService: ConfirmationService,
    private carritoService: CarritoService, private router: Router
  ) {
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

  confirmar(): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        '<strong>Prenda:</strong> ' + this.tiposPrenda.find(p => p.value === this.formulario.get('tipo')?.value)?.label +
        '<br/><strong>Talle:</strong> ' + this.talles.find(p => p.value === this.formulario.get('talle')?.value)?.label +
        '<br/><strong>Color de prenda:</strong> ' + this.coloresPrendas.find(p => p.value === this.formulario.get('colorPrenda')?.value)?.label +
        '<br/><strong>Color del hilado:</strong> ' + this.coloresHilado.find(p => p.value === this.formulario.get('colorHilado1')?.value)?.label +
        (this.formulario.get('usarSegundoColor')?.value ? '<br/><strong>2° Color del hilado:</strong> ' + this.coloresHilado.find(p => p.value === this.formulario.get('colorHilado2')?.value)?.label : '') +
        '<br/><strong>Imagen:</strong> ' + this.imageFile?.name +
        '<br/><strong>Cantidad:</strong> ' + this.cantidades.find(p => p.value === this.formulario.get('cantidad')?.value)?.label
      ,
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
      colorHilado2!.setValidators(Validators.required);
      colorHilado2?.markAsDirty();
    } else {
      colorHilado2?.clearValidators();
      // colorHilado2?.setValue(undefined); // opcional: limpiar campo
      colorHilado2?.reset(); // Esto deselecciona el selectbutton
    }

    colorHilado2?.updateValueAndValidity();
  }

  eliminarImagen(event: any, removeFileCallback: any) {
    removeFileCallback(event, 0);
    this.imageFile = undefined;
    this.imageURL = undefined;
    this.totalSizePercent = 0;
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
        // this.formulario.get('imagen')?.setErrors({ 'fileSize': this.invalidFileSizeMessageSummary });
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

        this.totalSizePercent = imageSize * 100 / this.maxImageSize;
        console.log(this.totalSizePercent);

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
    const option: { label: string, value: string } | undefined = options.find(opt => opt.value === value);

    return option?.label || '';
  }

  getPrecio(controlName: string, options: any[]): number {
    return options.find(opt => opt.value === this.formulario.get(controlName)?.value)?.precio || 0;
  }

  calcularPrecioUnitario(): number {
    let base: number = 0;

    const precioPrenda: number | undefined = this.tiposPrenda.find(p => p.value === this.formulario.get('tipo')?.value)?.precio;
    const usarSegundoColor: boolean = this.formulario.get('usarSegundoColor')?.value;

    base += precioPrenda || 0;
    // Sumar si se usa segundo color
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

    const nuevoItem: CarritoItem = {
      id: crypto.randomUUID(),
      tipo: this.getLabel('tipo', this.tiposPrenda),
      talle: this.getLabel('talle', this.talles),
      colorPrenda: this.getLabel('colorPrenda', this.coloresPrendas),
      colorHilado1: this.getLabel('colorHilado1', this.coloresHilado),
      colorHilado2: datos.usarSegundoColor ? this.getLabel('colorHilado2', this.coloresHilado) : undefined,
      imagen: this.imageURL!,
      cantidad: datos.cantidad,
      precioUnitario: this.calcularPrecioUnitario(),
      subtotal: this.calcularSubtotal()
    };

    this.carritoService.agregarItem(nuevoItem);
  }

}
