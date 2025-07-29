import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputMask } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { Customer } from '../../../../models/customer';
import { Order } from '../../../../models/order';
import { CustomersService } from '../../../../services/customers.service';

@Component({
    selector: 'app-customers-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Select,
        Dialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        InputMask,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './customers-tab.component.html',
    styleUrl: './customers-tab.component.scss'
})
export class CustomersTabComponent implements OnInit {

    // Customer Management
    customers: Customer[] = [];
    customersLoading: boolean = false;

    // Customer Dialog
    showCustomerDialog: boolean = false;
    editingCustomer: Customer | null = null;
    customerForm!: FormGroup;
    customerLoading: boolean = false;

    // Customer Details Dialog
    showCustomerDetailsDialog: boolean = false;
    selectedCustomer: Customer | null = null;

    // Provinces for Argentina
    readonly provinces: { label: string, value: string }[] = [
        { label: 'Buenos Aires', value: 'Buenos Aires' },
        { label: 'CABA', value: 'CABA' },
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

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private customersService: CustomersService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadCustomers();
        this.initForms();
    }

    private initForms(): void {
        // Customer Form
        this.customerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(10)]],
            dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]],
            province: ['', Validators.required],
            city: ['', [Validators.required, Validators.minLength(2)]],
            postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(5)]],
            address: ['', [Validators.required, Validators.minLength(5)]],
            floorApartment: ['']
        });
    }

    private loadCustomers(): void {
        this.customersLoading = true;

        // Load customers
        this.customersService.getCustomers().subscribe({
            next: (customers) => {
                this.customers = customers;
                this.customersLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los clientes: ' + error.message
                });
                this.customersLoading = false;
            }
        });
    }

    // Customer Management Methods
    getCustomerOrderCount(customerId: string): number {
        // This would need to be updated to get orders from a service
        // For now, returning 0 as placeholder
        return 0;
    }

    getCustomerTotalSpent(customerId: string): number {
        // This would need to be updated to get orders from a service
        // For now, returning 0 as placeholder
        return 0;
    }

    getCustomerOrders(customerId: string): Order[] {
        // This would need to be updated to get orders from a service
        // For now, returning empty array as placeholder
        return [];
    }

    openCustomerDialog(customer?: Customer): void {
        this.editingCustomer = customer || null;
        if (customer) {
            this.customerForm.patchValue(customer);
        } else {
            this.customerForm.reset();
        }
        this.showCustomerDialog = true;
    }

    saveCustomer(): void {
        if (this.customerForm.valid) {
            this.customerLoading = true;
            const formValue = this.customerForm.value;

            if (this.editingCustomer) {
                // Update existing customer
                const updatedCustomer = { ...this.editingCustomer, ...formValue };
                this.customersService.updateCustomer(updatedCustomer).subscribe({
                    next: (customer) => {
                        const index = this.customers.findIndex(c => c.id === customer.id);
                        if (index !== -1) {
                            this.customers[index] = customer;
                        }
                        // Update selectedCustomer if it's the same customer being edited
                        if (this.selectedCustomer && this.selectedCustomer.id === customer.id) {
                            this.selectedCustomer = customer;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: 'Cliente actualizado correctamente'
                        });
                        this.showCustomerDialog = false;
                        this.editingCustomer = null;
                        this.customerLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el cliente: ' + error.message
                        });
                        this.customerLoading = false;
                    }
                });
            } else {
                // Create new customer
                this.customersService.createCustomer(formValue).subscribe({
                    next: (newCustomer) => {
                        this.customers.push(newCustomer);
                        // Update selectedCustomer if we want to show the newly created customer
                        if (this.showCustomerDetailsDialog) {
                            this.selectedCustomer = newCustomer;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: 'Cliente creado correctamente'
                        });
                        this.showCustomerDialog = false;
                        this.editingCustomer = null;
                        this.customerLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el cliente: ' + error.message
                        });
                        this.customerLoading = false;
                    }
                });
            }
        }
    }

    viewCustomer(customer: Customer): void {
        this.selectedCustomer = customer;
        this.showCustomerDetailsDialog = true;
    }

    editCustomer(customer: Customer): void {
        this.openCustomerDialog(customer);
    }

    confirmDeleteCustomer(customer: Customer): void {
        const orderCount = this.getCustomerOrderCount(customer.id);
        const message = orderCount > 0
            ? `¿Estás seguro de eliminar al cliente ID: ${customer.id} - ${customer.name} ${customer.lastName}? Tiene ${orderCount} pedido/s asociado/s.`
            : `¿Estás seguro de eliminar al cliente ID: ${customer.id} - ${customer.name} ${customer.lastName}?`;

        this.confirmationService.confirm({
            message: message,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteCustomer(customer);
            }
        });
    }

    deleteCustomer(customer: Customer): void {
        this.customersService.deleteCustomer(customer.id).subscribe({
            next: () => {
                this.customers = this.customers.filter(c => c.id !== customer.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente eliminado',
                    detail: `El cliente ID: ${customer.id} - ${customer.name} ${customer.lastName} ha sido eliminado correctamente`
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el cliente: ' + error.message
                });
            }
        });
    }

    exportCustomers(): void {
        // Create CSV content for customers
        const csvContent = this.customers.map(customer =>
            `${customer.id},${customer.name} ${customer.lastName},${customer.email},${customer.phone},${customer.dni},${customer.province},${customer.city},${customer.postalCode},${customer.address},${customer.floorApartment || ''},${this.getCustomerOrderCount(customer.id)},${this.getCustomerTotalSpent(customer.id)}`
        ).join('\n');

        // Add header
        const header = 'ID,Nombre,Email,Teléfono,DNI,Provincia,Localidad,Código Postal,Dirección,Piso/Depto,Pedidos,Total Gastado\n';
        const fullContent = header + csvContent;

        // Create and download CSV file
        const blob = new Blob([fullContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
            severity: 'success',
            summary: 'Exportación exitosa',
            detail: 'Los clientes han sido exportados correctamente'
        });
    }

    // Table sorting method
    onSort(event: any): void {
        // This method is called when table columns are sorted
        // The PrimeNG table handles sorting automatically, so this method can be empty
        // or you can add custom sorting logic here if needed
        console.log('Sort event:', event);
    }

} 