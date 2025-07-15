import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Checkbox } from 'primeng/checkbox';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ErrorHelperComponent } from '../../shared/error-helper/error-helper.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ErrorHelperComponent,
    Button,
    Card,
    InputText,
    Password,
    Checkbox,
    Divider,
    Toast,
    ProgressSpinner,
    InputGroup,
    InputGroupAddon
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Por favor completa todos los campos correctamente',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      const { email, password, rememberMe } = this.loginForm.value;

      // Mock authentication - replace with real auth service
      if (email === 'admin@bordados.com' && password === '123456') {
        this.messageService.add({
          severity: 'success',
          summary: 'Inicio de sesión exitoso',
          detail: 'Bienvenido al panel de administración',
          life: 3000
        });

        // Store auth state
        if (rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', email);
        } else {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userEmail', email);
        }

        // Navigate to admin
        setTimeout(() => {
          this.router.navigate(['/admin-products']);
        }, 1000);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: 'Email o contraseña incorrectos',
          life: 3000
        });
      }

      this.isLoading = false;
    }, 1500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'El email' : 'La contraseña'} es requerido`;
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

}
