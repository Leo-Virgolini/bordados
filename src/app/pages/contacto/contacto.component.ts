import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Textarea } from 'primeng/textarea';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';
import { ContactForm } from '../../model/contact-form';

@Component({
    selector: 'app-contacto',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        Textarea,
        InputGroupModule,
        InputGroupAddonModule,
        InputMaskModule,
        ToastModule,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './contacto.component.html',
    styleUrl: './contacto.component.scss'
})
export class ContactoComponent {

    private fb = inject(FormBuilder);

    contactForm: FormGroup;
    isSubmitting = false;

    constructor(private messageService: MessageService) {
        this.contactForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
            subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
            message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
        });
    }

    onSubmit(): void {
        if (this.contactForm.valid) {
            this.isSubmitting = true;

            // Simulate API call
            setTimeout(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: '¡Mensaje enviado!',
                    detail: 'Gracias por contactarnos. Te responderemos pronto.',
                    life: 5000
                });

                this.contactForm.reset();
                this.isSubmitting = false;
            }, 1500);
        } else {
            this.markFormGroupTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'Por favor, completa todos los campos correctamente.',
                life: 5000
            });
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.contactForm.controls).forEach(key => {
            const control = this.contactForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: keyof ContactForm): boolean {
        const field = this.contactForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    getFieldError(fieldName: keyof ContactForm): string {
        const field = this.contactForm.get(fieldName);

        if (field?.errors) {
            if (field.errors['required']) {
                return 'Este campo es requerido';
            }
            if (field.errors['email']) {
                return 'Ingresa un email válido';
            }
            if (field.errors['minlength']) {
                const requiredLength = field.errors['minlength'].requiredLength;
                return `Mínimo ${requiredLength} caracteres`;
            }
            if (field.errors['maxlength']) {
                const requiredLength = field.errors['maxlength'].requiredLength;
                return `Máximo ${requiredLength} caracteres`;
            }
        }

        return '';
    }
} 