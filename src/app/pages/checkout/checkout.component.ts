import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../models/cart-item';
import { SettingsService } from '../../services/settings.service';
import { CouponsService } from '../../services/coupons.service';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { Panel } from 'primeng/panel';
import { InputText } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Coupon } from '../../models/coupon';
import { Image } from 'primeng/image';
import { ProductBase } from '../../models/product-base';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderItem } from '../../models/order';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ErrorHelperComponent,
    Panel,
    InputText,
    InputMask,
    InputGroup,
    InputGroupAddon,
    Button,
    Textarea,
    RadioButton,
    Card,
    Checkbox,
    Divider,
    Toast,
    Tag,
    Select,
    Dialog,
    Image
  ],
  providers: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  checkoutForm!: FormGroup;
  isProcessing: boolean = false;
  showTermsDialog: boolean = false;
  showPrivacyDialog: boolean = false;
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  cashDiscountPercentage: number = 0; // Will be loaded from settings service
  discount: number = 0;
  readonly ivaPercentage: number = 0.21;
  iva: number = 0;
  total: number = 0;
  freeShippingThreshold: number = 50000; // Default value, will be loaded from service

  // Coupon properties
  selectedCoupon: Coupon | null = null;
  couponLoading: boolean = false;
  couponDiscount: number = 0;
  showCouponInput: boolean = false;
  readonly transferData: string = 'CBU: 00000000000000000000000000000000\n' +
    'Alias: alias.alias.alias\n' +
    'Banco: Banco Galicia';

  readonly mercadopagoData: string = 'Para pagar con MercadoPago:\n\n' +
    '1. Serás redirigido a MercadoPago\n' +
    '2. Podrás pagar con tarjeta, efectivo o transferencia\n' +
    '3. Recibirás confirmación por email\n' +
    '4. Tu pedido se procesará automáticamente';

  provinces = [
    { label: 'Buenos Aires', value: 'Buenos Aires' },
    { label: 'C.A.B.A. (Ciudad Autónoma de Buenos Aires)', value: 'CABA' },
    { label: 'Catamarca', value: 'Catamarca' },
    { label: 'Chaco', value: 'Chaco' },
    { label: 'Chubut', value: 'Chubut' },
    { label: 'Córdoba', value: 'Córdoba' },
    { label: 'Corrientes', value: 'Corrientes' },
    { label: 'Entre Ríos', value: 'Entre Ríos' },
    { label: 'Formosa', value: 'Formosa' },
    { label: 'Jujuy', value: 'Jujuy' },
    { label: 'La Pampa', value: 'La Pampa' },
    { label: 'La Rioja', value: 'La Rioja' },
    { label: 'Mendoza', value: 'Mendoza' },
    { label: 'Misiones', value: 'Misiones' },
    { label: 'Neuquén', value: 'Neuquén' },
    { label: 'Río Negro', value: 'Río Negro' },
    { label: 'Salta', value: 'Salta' },
    { label: 'San Juan', value: 'San Juan' },
    { label: 'San Luis', value: 'San Luis' },
    { label: 'Santa Cruz', value: 'Santa Cruz' },
    { label: 'Santa Fe', value: 'Santa Fe' },
    { label: 'Santiago del Estero', value: 'Santiago del Estero' },
    { label: 'Tierra del Fuego', value: 'Tierra del Fuego' },
    { label: 'Tucumán', value: 'Tucumán' }
  ];

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-AR');
  }

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private messageService: MessageService,
    private router: Router,
    private settingsService: SettingsService,
    private couponsService: CouponsService,
    private ordersService: OrdersService
  ) {
  }

  ngOnInit() {
    this.loadOrderItems();

    // Check if cart is empty and redirect if necessary
    if (this.cartItems.length === 0) {
      this.router.navigate(['/carrito']);
      return;
    }

    // Lightweight frontend validation
    if (!this.validateCartLocally()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Carrito inválido',
        detail: 'Hay productos en el carrito que no pueden ser procesados.',
        life: 5000
      });
      this.router.navigate(['/carrito']);
      return;
    }

    // Initialize form and settings without heavy API validation
    this.initForm();
    this.loadSettings();
    this.calculateTotals();

    // Listen to payment method changes
    this.checkoutForm.get('selectedPaymentMethod')?.valueChanges.subscribe(value => {
      this.onChange();
    });
  }

  /**
   * Lightweight frontend validation - basic checks that don't require API calls
   */
  private validateCartLocally(): boolean {
    if (this.cartItems.length === 0) return false;

    // Check if all items have required properties
    return this.cartItems.every(item =>
      item.product?.id &&
      item.quantity > 0 &&
      item.product.price > 0 &&
      item.product.name &&
      item.total > 0
    );
  }

  /**
   * Get payment details based on selected payment method
   */
  private getPaymentDetails(): any {
    const paymentMethod = this.checkoutForm.get('selectedPaymentMethod')?.value;

    if (paymentMethod === 'creditCard') {
      return {
        cardNumber: this.checkoutForm.get('cardNumber')?.value,
        expiryDate: this.checkoutForm.get('expiryDate')?.value,
        cvv: this.checkoutForm.get('cvv')?.value,
        cardholderName: this.checkoutForm.get('cardholderName')?.value
      };
    } else if (paymentMethod === 'mercadopago') {
      return { provider: 'mercadopago' };
    } else if (paymentMethod === 'transfer') {
      return { provider: 'transfer' };
    }

    return {};
  }

  /**
   * Handle successful order creation
   */
  private handleSuccessfulOrder(order: any): void {
    this.isProcessing = false;
    this.messageService.add({
      severity: 'success',
      summary: '¡Pago Exitoso!',
      detail: 'Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación.',
      life: 5000
    });

    // Clear cart and redirect to home
    this.carritoService.vaciarCarrito();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  /**
   * Handle order creation errors
   */
  private handleOrderError(error: any): void {
    this.isProcessing = false;

    if (error.status === 400) {
      // Validation errors from backend
      if (error.error?.message) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: error.error.message,
          life: 5000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'Los datos del pedido no son válidos. Por favor, revisá la información.',
          life: 5000
        });
      }
    } else if (error.status === 409) {
      // Conflict - products no longer available
      this.messageService.add({
        severity: 'error',
        summary: 'Productos no disponibles',
        detail: 'Algunos productos ya no están disponibles. El carrito ha sido actualizado.',
        life: 5000
      });

      // Refresh cart items (backend should have updated them)
      this.loadOrderItems();
      this.calculateTotals();
    } else {
      // Generic error
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al procesar el pedido. Por favor, intentá nuevamente.',
        life: 5000
      });
    }
  }

  /**
   * Map frontend payment method to backend payment method
   */
  private mapPaymentMethod(frontendMethod: string): 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago' {
    const mapping: { [key: string]: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago' } = {
      'creditCard': 'tarjeta',
      'transfer': 'transferencia',
      'mercadopago': 'mercadopago'
    };
    return mapping[frontendMethod] || 'efectivo';
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern(/^\d*$/)]],
      provincia: ['', [Validators.required]],
      localidad: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      postalCode: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[\dA-Za-z]*$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      pisoDepto: ['', [Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ°\s]*$/)]],
      selectedPaymentMethod: ['creditCard', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.pattern(/^[\d\s]*$/)]],
      expiryDate: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d*$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      couponCode: [''],
      notes: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  private loadOrderItems(): void {
    this.cartItems = this.carritoService.getCarrito();
  }

  private loadSettings(): void {
    this.settingsService.getFreeShippingThreshold().subscribe(threshold => {
      this.freeShippingThreshold = threshold;
    });

    this.settingsService.getDiscountPercentage().subscribe(percentage => {
      this.cashDiscountPercentage = percentage / 100; // Convert percentage to decimal
    });
  }

  private calculateTotals(): void {
    this.subtotal = this.carritoService.getTotalPrice();
    this.iva = this.subtotal * this.ivaPercentage; // 21% IVA

    // Calculate discount based on payment method
    const selectedPaymentMethod: string = this.checkoutForm.get('selectedPaymentMethod')?.value;
    if (selectedPaymentMethod === 'transfer') {
      this.discount = (this.subtotal) * this.cashDiscountPercentage; // discount on subtotal + IVA
    } else if (selectedPaymentMethod === 'mercadopago') {
      this.discount = 0; // no discount for MercadoPago
    } else {
      this.discount = 0; // no discount for credit card
    }

    // Apply coupon discount
    const totalAfterPaymentDiscount = this.subtotal - this.discount;
    this.total = totalAfterPaymentDiscount - this.couponDiscount;
  }

  isShippingFree(): boolean {
    return this.total >= this.freeShippingThreshold;
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

  validateAndApplyCoupon(): void {
    const couponCode = this.checkoutForm.get('couponCode')?.value;
    if (!couponCode) {
      this.selectedCoupon = null;
      this.couponDiscount = 0;
      this.calculateTotals();
      return;
    }

    this.couponLoading = true;
    const subtotal = this.subtotal;

    this.couponsService.validateCoupon(couponCode, subtotal).subscribe({
      next: (result) => {
        if (result.valid && result.coupon) {
          // Apply coupon
          this.selectedCoupon = result.coupon;
          let discountAmount = 0;

          if (result.coupon.discountType === 'percentage') {
            discountAmount = subtotal * (result.coupon.discountValue / 100);
          } else {
            discountAmount = result.coupon.discountValue;
          }

          // Ensure discount doesn't exceed subtotal
          discountAmount = Math.min(discountAmount, subtotal);
          this.couponDiscount = discountAmount;

          this.messageService.add({
            severity: 'success',
            summary: 'Cupón aplicado',
            detail: `Descuento de ${result.coupon.discountType === 'percentage' ? result.coupon.discountValue + '%' : '$' + result.coupon.discountValue.toLocaleString('es-AR')} aplicado`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Cupón inválido',
            detail: result.error || 'El código de cupón no es válido'
          });
          this.selectedCoupon = null;
          this.couponDiscount = 0;
          this.checkoutForm.get('couponCode')?.setValue('');
        }
        this.couponLoading = false;
        this.calculateTotals();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al validar el cupón: ' + error.message
        });
        this.selectedCoupon = null;
        this.couponDiscount = 0;
        this.checkoutForm.get('couponCode')?.setValue('');
        this.couponLoading = false;
        this.calculateTotals();
      }
    });
  }

  clearCoupon(): void {
    this.selectedCoupon = null;
    this.couponDiscount = 0;
    this.checkoutForm.get('couponCode')?.setValue('');
    this.calculateTotals();
    this.messageService.add({
      severity: 'info',
      summary: 'Cupón removido',
      detail: 'El cupón ha sido removido del pedido',
      life: 3000
    });
  }

  toggleCouponInput(): void {
    this.showCouponInput = !this.showCouponInput;
    if (!this.showCouponInput) {
      // Clear the coupon code when hiding the input
      this.checkoutForm.get('couponCode')?.setValue('');
    }
  }

  getCouponDisplayValue(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.code} - ${coupon.discountValue}%`;
    } else {
      return `${coupon.code} - $${coupon.discountValue.toLocaleString('es-AR')}`;
    }
  }

  getDiscountPercentage(): number {
    const subtotal = this.subtotal;
    const totalDiscount = this.discount + this.couponDiscount;

    if (subtotal > 0 && totalDiscount > 0) {
      return Math.round((totalDiscount / subtotal) * 100);
    }
    return 0;
  }

  onChange(): void {
    const selectedPaymentMethod: string = this.checkoutForm.get('selectedPaymentMethod')?.value;
    const cardNumber = this.checkoutForm.get('cardNumber');
    const expiryDate = this.checkoutForm.get('expiryDate');
    const cvv = this.checkoutForm.get('cvv');
    const cardholderName = this.checkoutForm.get('cardholderName');

    if (selectedPaymentMethod === 'creditCard') {
      cardNumber?.setValidators([Validators.required, Validators.minLength(16), Validators.pattern(/^[\d\s]*$/)]);
      expiryDate?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(/^\d{2}\/\d{2}$/)]);
      cvv?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d*$/)]);
      cardholderName?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]);
    } else {
      cardNumber?.clearValidators();
      cardNumber?.reset();
      expiryDate?.clearValidators();
      expiryDate?.reset();
      cvv?.clearValidators();
      cvv?.reset();
      cardholderName?.clearValidators();
      cardholderName?.reset();
    }

    cardNumber?.updateValueAndValidity();
    expiryDate?.updateValueAndValidity();
    cvv?.updateValueAndValidity();
    cardholderName?.updateValueAndValidity();

    // Recalculate totals when payment method changes
    this.calculateTotals();
  }

  openTermsDialog(): void {
    this.showTermsDialog = true;
  }

  closeTermsDialog(): void {
    this.showTermsDialog = false;
  }

  openPrivacyDialog(): void {
    this.showPrivacyDialog = true;
  }

  closePrivacyDialog(): void {
    this.showPrivacyDialog = false;
  }

  processPayment(): void {
    if (this.checkoutForm.valid && this.checkoutForm.get('acceptTerms')?.value) {
      // Check if cart is empty
      if (this.carritoService.isCartEmpty()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El carrito está vacío. Por favor, agregá productos antes de continuar.',
          life: 5000
        });
        this.router.navigate(['/carrito']);
        return;
      }

      this.isProcessing = true;

      // Track coupon usage if a coupon was applied
      if (this.selectedCoupon) {
        this.couponsService.applyCouponUsage(this.selectedCoupon.code).subscribe({
          next: () => {
            console.log('Coupon usage tracked successfully');
          },
          error: (error) => {
            console.error('Error tracking coupon usage:', error);
          }
        });
      }

      // Create order data for backend validation
      const order: Omit<Order, 'id'> = new Order({
        date: new Date(),
        customerId: 0,
        status: 'pendiente',
        shippingAddress: this.checkoutForm.get('address')?.value,
        shippingCity: this.checkoutForm.get('localidad')?.value,
        shippingProvince: this.checkoutForm.get('provincia')?.value,
        shippingPostalCode: this.checkoutForm.get('postalCode')?.value,
        shippingFloorApartment: this.checkoutForm.get('pisoDepto')?.value,
        notes: this.checkoutForm.get('notes')?.value,
        items: this.cartItems.map(item => item.toOrderItem()), // Convert CartItems to OrderItems
        customerSnapshot: {
          name: this.checkoutForm.get('firstName')?.value,
          lastName: this.checkoutForm.get('lastName')?.value,
          email: this.checkoutForm.get('email')?.value,
          phone: this.checkoutForm.get('phone')?.value,
          dni: this.checkoutForm.get('dni')?.value,
          province: this.checkoutForm.get('provincia')?.value,
          city: this.checkoutForm.get('localidad')?.value,
          postalCode: this.checkoutForm.get('postalCode')?.value,
          address: this.checkoutForm.get('address')?.value,
          floorApartment: this.checkoutForm.get('pisoDepto')?.value
        },
        paymentMethod: this.mapPaymentMethod(this.checkoutForm.get('selectedPaymentMethod')?.value),
        couponCode: this.selectedCoupon?.code,
        subtotal: this.subtotal,
        couponDiscount: this.couponDiscount,
        shippingPrice: this.isShippingFree() ? 0 : 0, // Will be calculated by backend
        total: this.total
      });

      this.ordersService.createOrder(order).subscribe({
        next: (order) => {
          this.handleSuccessfulOrder(order);
        },
        error: (error) => {
          this.handleOrderError(error);
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, completá todos los campos requeridos y aceptá los términos.',
        life: 5000
      });
    }
  }

  getProductImage(product: any): string | undefined {
    return product.variants?.[0]?.image || 'sin_imagen.png';
  }

  onImageError(event: any, product: ProductBase): void {
    // Update the image source to show default image
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'sin_imagen.png';
      imgElement.alt = `${product.name}`;
    }
  }

}