import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Checkbox } from 'primeng/checkbox';
import { Textarea } from 'primeng/textarea';
import { MultiSelect } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ErrorHelperComponent } from '../../../../../shared/error-helper/error-helper.component';
import { ProductTypesService } from '../../../../../services/product-types.service';
import { ProductType } from '../../../../../model/product-type';

@Component({
    selector: 'app-product-types-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Dialog,
        Card,
        Tag,
        InputGroup,
        InputGroupAddon,
        Checkbox,
        Textarea,
        MultiSelect,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './product-types-tab.component.html',
    styleUrl: './product-types-tab.component.scss'
})
export class ProductTypesTabComponent implements OnInit {

    productTypes: ProductType[] = [];
    productTypeForm!: FormGroup;
    showProductTypeDialog: boolean = false;
    editingProductType: ProductType | null = null;
    productTypeLoading: boolean = false;
    stockControls: { [key: string]: FormControl } = {};

    talles: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productTypesService: ProductTypesService
    ) { }

    ngOnInit() {
        this.loadProductTypes();
        this.initForm();
    }

    private loadProductTypes(): void {
        this.productTypesService.getProductTypes().subscribe({
            next: (productTypes: ProductType[]) => {
                this.productTypes = productTypes;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los tipos de productos: ' + error.message
                });
            }
        });
    }

    private initForm(): void {
        this.productTypeForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            price: [0, [Validators.required, Validators.min(0)]],
            sizes: [[], [Validators.required]],
            stock: this.fb.group({}),
            active: [true]
        });
    }

    openProductTypeDialog(productType?: ProductType): void {
        if (productType) {
            // Create a deep copy to avoid modifying the original object
            this.editingProductType = new ProductType({
                ...productType,
                stock: { ...productType.stock }
            });

            // Reset form completely first
            this.productTypeForm.reset();

            // Initialize size controls first
            this.initializeSizeControls(this.editingProductType.sizes);

            // Create the complete form value including stock
            const formValue = {
                name: this.editingProductType.name,
                description: this.editingProductType.description,
                price: this.editingProductType.price,
                sizes: this.editingProductType.sizes,
                stock: this.editingProductType.stock,
                active: this.editingProductType.active
            };

            this.productTypeForm.patchValue(formValue);
        } else {
            this.editingProductType = null;
            this.productTypeForm.reset({ active: true, sizes: [] });
            this.initializeSizeControls([]);
            this.stockControls = {};
        }
        this.showProductTypeDialog = true;
    }

    private initializeSizeControls(sizes: string[]): void {
        const stockControl = this.productTypeForm.get('stock') as FormGroup;

        // Clear existing controls
        Object.keys(stockControl.controls).forEach(key => {
            stockControl.removeControl(key);
        });

        // Add stock controls for each size with default value 0
        sizes.forEach(size => {
            stockControl.addControl(size, this.fb.control(0, [Validators.required, Validators.min(0)]));
        });
    }

    saveProductType(): void {
        if (this.productTypeForm.valid) {
            this.productTypeLoading = true;
            const formValue = this.productTypeForm.value;

            if (this.editingProductType) {
                // Update existing
                const updatedProductType = new ProductType({
                    id: this.editingProductType.id,
                    name: formValue.name,
                    description: formValue.description,
                    price: formValue.price,
                    sizes: formValue.sizes,
                    stock: { ...formValue.stock }, // Ensure we create a new object
                    active: formValue.active
                });

                this.productTypesService.updateProductType(updatedProductType).subscribe({
                    next: (productType: ProductType) => {
                        const index = this.productTypes.findIndex(pt => pt.id === productType.id);
                        if (index !== -1) {
                            this.productTypes[index] = productType;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: 'Tipo de producto actualizado correctamente'
                        });
                        this.showProductTypeDialog = false;
                        this.editingProductType = null;
                        this.productTypeLoading = false;
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el tipo de producto: ' + error.message
                        });
                        this.productTypeLoading = false;
                    }
                });
            } else {
                // Create new
                this.productTypesService.createProductType(formValue).subscribe({
                    next: (newProductType: ProductType) => {
                        this.productTypes.push(newProductType);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: 'Tipo de producto creado correctamente'
                        });
                        this.showProductTypeDialog = false;
                        this.editingProductType = null;
                        this.productTypeLoading = false;
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el tipo de producto: ' + error.message
                        });
                        this.productTypeLoading = false;
                    }
                });
            }
        }
    }

    deleteProductType(productType: ProductType): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el tipo "${productType.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productTypesService.deleteProductType(productType.id).subscribe({
                    next: () => {
                        this.productTypes = this.productTypes.filter(pt => pt.id !== productType.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Tipo de producto eliminado correctamente'
                        });
                    },
                    error: (error: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar el tipo de producto: ' + error.message
                        });
                    }
                });
            }
        });
    }

    onSizesChange(event: any): void {
        const selectedSizes = event.value || [];
        this.initializeSizeControls(selectedSizes);
    }

    getStockControl(size: string): FormControl {
        const stockGroup = this.productTypeForm.get('stock') as FormGroup;
        return stockGroup.get(size) as FormControl;
    }
} 