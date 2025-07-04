import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../model/carrito-item';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { Panel } from 'primeng/panel';
import { InputText } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { Button } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
    ErrorHelperComponent,
    Panel,
    InputText,
    InputMask,
    Button,
    RadioButton,
    Checkbox,
    Divider,
    Toast,
    Tag
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  checkoutForm!: FormGroup;
  isProcessing: boolean = false;
  orderItems: CarritoItem[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initForm();
    this.loadOrderItems();
    this.calculateTotals();
  }

  ngOnInit() {
    // this.initForm();
    // this.loadOrderItems();
    // this.calculateTotals();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      postalCode: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[\dA-Za-z]*$/)]],
      selectedPaymentMethod: ['creditCard', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.pattern(/^[\d\s]*$/)]],
      expiryDate: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d*$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  private loadOrderItems(): void {
    this.orderItems = this.carritoService.getCarrito();
  }

  private calculateTotals(): void {
    this.subtotal = this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.iva = this.subtotal * 0.21; // 21% IVA
    this.total = this.subtotal + this.iva;
  }

  onChange(): void {
    const selectedPaymentMethod: string = this.checkoutForm.get('selectedPaymentMethod')?.value;
    const cardNumber = this.checkoutForm.get('cardNumber');
    const expiryDate = this.checkoutForm.get('expiryDate');
    const cvv = this.checkoutForm.get('cvv');
    const cardholderName = this.checkoutForm.get('cardholderName');

    if (selectedPaymentMethod === 'creditCard') {
      cardNumber?.setValidators([Validators.required, Validators.minLength(16), Validators.pattern(/^[\d\s]*$/)]);
      cardNumber?.markAsDirty();
      expiryDate?.setValidators([Validators.required, Validators.minLength(5), Validators.pattern(/^\d{2}\/\d{2}$/)]);
      expiryDate?.markAsDirty();
      cvv?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d*$/)]);
      cvv?.markAsDirty();
      cardholderName?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]);
      cardholderName?.markAsDirty();
    } else {
      cardNumber?.clearValidators();
      cardNumber?.reset(); // Esto deselecciona el selectbutton
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
  }

  processPayment(): void {
    if (this.checkoutForm.valid && this.checkoutForm.get('acceptTerms')?.value) {
      this.isProcessing = true;

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