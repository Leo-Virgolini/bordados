import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../model/cart-item';
import { SettingsService } from '../../services/settings.service';
import { CouponsService, DiscountCoupon } from '../../services/coupons.service';
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
    RadioButton,
    Card,
    Checkbox,
    Divider,
    Toast,
    Tag,
    Select,
    Dialog
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  checkoutForm!: FormGroup;
  isProcessing: boolean = false;
  showTermsDialog: boolean = false;
  showPrivacyDialog: boolean = false;
  orderItems: CartItem[] = [];
  subtotal: number = 0;
  discountPercentage: number = 0.10;
  discount: number = 0;
  ivaPercentage: number = 0.21;
  iva: number = 0;
  total: number = 0;
  freeShippingThreshold: number = 50000; // Default value, will be loaded from service

  // Coupon properties
  selectedCoupon: DiscountCoupon | null = null;
  couponLoading: boolean = false;
  couponDiscount: number = 0;
  transferData: string = 'CBU: 00000000000000000000000000000000\n' +
    'Alias: alias.alias.alias\n' +
    'Banco: Banco Galicia';

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

  mercadopagoData = 'Para pagar con MercadoPago:\n\n' +
    '1. Serás redirigido a MercadoPago\n' +
    '2. Podrás pagar con tarjeta, efectivo o transferencia\n' +
    '3. Recibirás confirmación por email\n' +
    '4. Tu pedido se procesará automáticamente';

  termsAndConditions = `
    <h2 class="text-xl font-bold mb-4">Términos y Condiciones</h2>
    
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">1. Aceptación de los Términos</h3>
      <p class="text-sm line-height-2">Al realizar una compra en nuestro sitio web, aceptás estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debés realizar una compra.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">2. Productos y Servicios</h3>
      <p class="text-sm line-height-2">Todos nuestros productos son bordados a mano con materiales de alta calidad. Los tiempos de entrega pueden variar según la complejidad del diseño y la disponibilidad de materiales.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">3. Precios y Pagos</h3>
      <p class="text-sm line-height-2">Todos los precios están expresados en pesos argentinos e incluyen IVA. Los pagos se procesan de forma segura a través de nuestros proveedores autorizados. Ofrecemos descuentos especiales para pagos por transferencia bancaria.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">4. Envíos y Entregas</h3>
      <p class="text-sm line-height-2">Realizamos envíos a todo el país a través de servicios de correo certificado. Los tiempos de entrega estimados son de 3-7 días hábiles para el interior del país y 1-3 días hábiles para CABA y GBA.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">5. Cambios y Devoluciones</h3>
      <p class="text-sm line-height-2">Aceptamos cambios y devoluciones dentro de los 30 días posteriores a la recepción del producto, siempre que el artículo esté en su estado original y sin usar. Los gastos de envío de devolución corren por cuenta del cliente.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">6. Garantía</h3>
      <p class="text-sm line-height-2">Todos nuestros productos tienen garantía de 6 meses por defectos de fabricación. La garantía no cubre el desgaste normal del uso ni daños causados por el cliente.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">7. Privacidad</h3>
      <p class="text-sm line-height-2">Tu información personal será tratada de acuerdo con nuestra política de privacidad. No compartimos tus datos con terceros sin tu consentimiento explícito.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">8. Contacto</h3>
      <p class="text-sm line-height-2">Para cualquier consulta sobre estos términos, podés contactarnos a través de nuestro formulario de contacto o por email a info@bordados.com.ar</p>
    </div>

    <div class="text-xs text-color-secondary mt-4">
      <p>Última actualización: ${new Date().toLocaleDateString('es-AR')}</p>
    </div>
  `;

  privacyPolicy = `
    <h2 class="text-xl font-bold mb-4">Política de Privacidad</h2>
    
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">1. Información que Recopilamos</h3>
      <p class="text-sm line-height-2">Recopilamos información que nos proporcionás directamente, como tu nombre, dirección de email, dirección postal, número de teléfono e información de pago cuando realizás una compra o te registrás en nuestro sitio web.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">2. Uso de la Información</h3>
      <p class="text-sm line-height-2">Utilizamos tu información personal para procesar pedidos, enviar confirmaciones, responder consultas, mejorar nuestros servicios y comunicarnos contigo sobre productos y ofertas que puedan interesarte.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">3. Compartir Información</h3>
      <p class="text-sm line-height-2">No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto cuando es necesario para procesar tu pedido (proveedores de pago, servicios de envío) o cuando la ley lo requiera.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">4. Seguridad de Datos</h3>
      <p class="text-sm line-height-2">Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos encriptación SSL para proteger los datos durante la transmisión.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">5. Cookies y Tecnologías Similares</h3>
      <p class="text-sm line-height-2">Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web, recordar tus preferencias y analizar el tráfico del sitio. Podés controlar el uso de cookies a través de la configuración de tu navegador.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">6. Tus Derechos</h3>
      <p class="text-sm line-height-2">Tenés derecho a acceder, corregir, actualizar o eliminar tu información personal. También podés optar por no recibir comunicaciones promocionales. Para ejercer estos derechos, contactanos a través de nuestro formulario de contacto.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">7. Retención de Datos</h3>
      <p class="text-sm line-height-2">Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">8. Menores de Edad</h3>
      <p class="text-sm line-height-2">Nuestro sitio web no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores de edad. Si sos menor de edad, no debés proporcionarnos información personal sin el consentimiento de tus padres o tutores.</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">9. Cambios en la Política</h3>
      <p class="text-sm line-height-2">Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en nuestro sitio web y actualizando la fecha de "Última actualización".</p>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">10. Contacto</h3>
      <p class="text-sm line-height-2">Si tenés preguntas sobre esta política de privacidad o sobre cómo manejamos tu información personal, contactanos a través de nuestro formulario de contacto o por email a privacidad@bordados.com.ar</p>
    </div>

    <div class="text-xs text-color-secondary mt-4">
      <p>Última actualización: ${new Date().toLocaleDateString('es-AR')}</p>
    </div>
  `;

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private settingsService: SettingsService,
    private couponsService: CouponsService
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.loadOrderItems();
    this.loadSettings();
    this.calculateTotals();

    // Listen to payment method changes
    this.checkoutForm.get('selectedPaymentMethod')?.valueChanges.subscribe(value => {
      this.onChange();
    });
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
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  private loadOrderItems(): void {
    this.orderItems = this.carritoService.getCarrito();
  }

  private loadSettings(): void {
    this.settingsService.getFreeShippingThreshold().subscribe(threshold => {
      this.freeShippingThreshold = threshold;
    });
  }

  private calculateTotals(): void {
    this.subtotal = this.orderItems.reduce((sum, item) => sum + item.total, 0);
    this.iva = this.subtotal * this.ivaPercentage; // 21% IVA

    // Calculate discount based on payment method
    const selectedPaymentMethod: string = this.checkoutForm.get('selectedPaymentMethod')?.value;
    if (selectedPaymentMethod === 'transfer') {
      this.discount = (this.subtotal) * this.discountPercentage; // discount on subtotal + IVA
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
      detail: 'El cupón ha sido removido del pedido'
    });
  }

  getCouponDisplayValue(coupon: DiscountCoupon): string {
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
      // cardNumber?.markAsDirty();
      expiryDate?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(/^\d{2}\/\d{2}$/)]);
      // expiryDate?.markAsDirty();
      cvv?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d*$/)]);
      // cvv?.markAsDirty();
      cardholderName?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]);
      // cardholderName?.markAsDirty();
    } else if (selectedPaymentMethod === 'mercadopago') {
      // MercadoPago doesn't need card details in our form
      cardNumber?.clearValidators();
      cardNumber?.reset();
      expiryDate?.clearValidators();
      expiryDate?.reset();
      cvv?.clearValidators();
      cvv?.reset();
      cardholderName?.clearValidators();
      cardholderName?.reset();
    } else {
      // Transfer method
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
      this.isProcessing = true;

      // Track coupon usage if a coupon was applied
      if (this.selectedCoupon) {
        this.couponsService.applyCouponUsage(this.selectedCoupon.id).subscribe({
          next: () => {
            console.log('Coupon usage tracked successfully');
          },
          error: (error) => {
            console.error('Error tracking coupon usage:', error);
          }
        });
      }

      // Simulate payment processing
      setTimeout(() => {
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
      }, 3000);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, completá todos los campos requeridos y aceptá los términos.',
        life: 5000
      });
    }
  }

}