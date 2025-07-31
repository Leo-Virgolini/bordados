import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Image } from 'primeng/image';
import { ErrorHelperComponent } from '../../../../../shared/error-helper/error-helper.component';
import { ProductsService } from '../../../../../services/products.service';
import { ProductCustomizable } from '../../../../../models/product-customizable';

@Component({
    selector: 'app-customized-products-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        InputNumber,
        Dialog,
        Tag,
        InputGroup,
        InputGroupAddon,
        Textarea,
        Select,
        Image,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './customized-products-tab.component.html',
    styleUrl: './customized-products-tab.component.scss'
})
export class CustomizedProductsTabComponent implements OnInit {

    customizableProducts: ProductCustomizable[] = [];
    customizableProductForm!: FormGroup;
    showCustomizableProductDialog: boolean = false;
    editingCustomizableProduct: ProductCustomizable | null = null;
    customizableProductsLoading: boolean = false;
    savingCustomizableProduct: boolean = false;
    availableColors: { label: string, value: string }[] = [];
    availableSizes: { label: string, value: string }[] = [];

    garmentTypes = [
        { label: 'Remera', value: 'remera' },
        { label: 'Buzo', value: 'buzo' },
        { label: 'Campera', value: 'campera' },
        { label: 'Pantalón', value: 'pantalon' },
        { label: 'Vestido', value: 'vestido' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService
    ) { }

    ngOnInit() {
        this.loadCustomizableProducts();
        this.initCustomizableProductForm();
        this.initAvailableOptions();
    }

    private initAvailableOptions(): void {
        this.availableColors = [
            { label: 'Blanco', value: 'Blanco' },
            { label: 'Negro', value: 'Negro' },
            { label: 'Gris', value: 'Gris' },
            { label: 'Azul', value: 'Azul' },
            { label: 'Rojo', value: 'Rojo' },
            { label: 'Verde', value: 'Verde' },
            { label: 'Amarillo', value: 'Amarillo' },
            { label: 'Naranja', value: 'Naranja' },
            { label: 'Rosa', value: 'Rosa' },
            { label: 'Violeta', value: 'Violeta' },
            { label: 'Marrón', value: 'Marrón' },
            { label: 'Beige', value: 'Beige' }
        ];

        this.availableSizes = [
            { label: 'XS', value: 'XS' },
            { label: 'S', value: 'S' },
            { label: 'M', value: 'M' },
            { label: 'L', value: 'L' },
            { label: 'XL', value: 'XL' },
            { label: 'XXL', value: 'XXL' },
            { label: 'XXXL', value: 'XXXL' }
        ];
    }

    private initCustomizableProductForm(): void {
        this.customizableProductForm = this.fb.group({
            id: ['', Validators.required],
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            garmentType: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            type: ['personalizable'],
            variants: this.fb.array([])
        });
    }

    loadCustomizableProducts(): void {
        this.customizableProductsLoading = true;
        this.productsService.getCustomizableProducts().subscribe({
            next: (products: ProductCustomizable[]) => {
                this.customizableProducts = products;
                this.customizableProductsLoading = false;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos personalizables: ' + error.message
                });
                this.customizableProductsLoading = false;
            }
        });
    }

    openCustomizableProductDialog(product?: ProductCustomizable): void {
        this.editingCustomizableProduct = product || null;
        this.customizableProductForm.reset();

        if (product) {
            // For editing, patch the product data but handle variants separately
            const productData: any = { ...product };
            this.customizableProductForm.patchValue(productData);

            // Handle variants separately
            if (product.variants && product.variants.length > 0) {
                // Clear existing variants
                while (this.customizableVariantsArray.length !== 0) {
                    this.customizableVariantsArray.removeAt(0);
                }

                // Add each variant
                product.variants.forEach(variant => {
                    const variantGroup = this.fb.group({
                        color: [variant.color, Validators.required],
                        image: [variant.image || ''],
                        sizes: this.fb.array([])
                    });

                    // Add sizes for this variant
                    if (variant.sizes && variant.sizes.length > 0) {
                        variant.sizes.forEach(sizeStock => {
                            const sizeGroup = this.fb.group({
                                size: [sizeStock.size, Validators.required],
                                stock: [sizeStock.stock, [Validators.required, Validators.min(0)]]
                            });
                            (variantGroup.get('sizes') as FormArray).push(sizeGroup);
                        });
                    }

                    this.customizableVariantsArray.push(variantGroup);
                });
            }
        } else {
            // For new product, add at least one variant
            this.addCustomizableVariant();
        }

        this.showCustomizableProductDialog = true;
    }

    saveCustomizableProduct(): void {
        if (this.customizableProductForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor, completa todos los campos requeridos'
            });
            return;
        }

        // Additional validation: check if all variants have sizes
        let allVariantsValid = true;
        for (let i = 0; i < this.customizableVariantsArray.length; i++) {
            const variant = this.customizableVariantsArray.at(i);
            const sizes = variant.get('sizes') as FormArray;
            if (sizes.length === 0) {
                allVariantsValid = false;
                break;
            }
        }

        if (!allVariantsValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'Todas las variantes deben tener al menos un talle configurado'
            });
            return;
        }

        this.savingCustomizableProduct = true;
        const formValue = this.customizableProductForm.value;

        // Build variants from form
        const variants = formValue.variants.map((variant: any) => ({
            color: variant.color,
            image: variant.image || '',
            sizes: variant.sizes.map((size: any) => ({
                size: size.size,
                stock: size.stock
            }))
        }));

        const productData = new ProductCustomizable({
            id: this.editingCustomizableProduct ? this.editingCustomizableProduct.id : formValue.id,
            name: formValue.name,
            description: formValue.description,
            garmentType: formValue.garmentType,
            price: formValue.price,
            type: formValue.type,
            variants: variants
        });

        if (this.editingCustomizableProduct) {
            // Update existing product
            this.productsService.updateCustomizableProduct(productData).subscribe({
                next: (product) => {
                    const index = this.customizableProducts.findIndex(p => p.id === product.id);
                    if (index !== -1) {
                        this.customizableProducts[index] = product;
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Producto personalizable actualizado correctamente'
                    });
                    this.showCustomizableProductDialog = false;
                    this.editingCustomizableProduct = null;
                    this.savingCustomizableProduct = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el producto: ' + error.message
                    });
                    this.savingCustomizableProduct = false;
                }
            });
        } else {
            // Create new product
            this.productsService.createCustomizableProduct(productData).subscribe({
                next: (product) => {
                    this.customizableProducts.push(product);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Producto personalizable creado correctamente'
                    });
                    this.showCustomizableProductDialog = false;
                    this.editingCustomizableProduct = null;
                    this.savingCustomizableProduct = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear el producto: ' + error.message
                    });
                    this.savingCustomizableProduct = false;
                }
            });
        }
    }

    editCustomizableProduct(product: ProductCustomizable): void {
        this.openCustomizableProductDialog(product);
    }

    confirmDeleteCustomizableProduct(product: ProductCustomizable): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteCustomizableProduct(product);
            }
        });
    }

    deleteCustomizableProduct(product: ProductCustomizable): void {
        this.productsService.deleteCustomizableProduct(product.id).subscribe({
            next: () => {
                this.customizableProducts = this.customizableProducts.filter(p => p.id !== product.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Producto personalizable eliminado correctamente'
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el producto: ' + error.message
                });
            }
        });
    }

    get customizableVariantsArray(): FormArray {
        return this.customizableProductForm.get('variants') as FormArray;
    }

    addCustomizableVariant(): void {
        const variantGroup = this.fb.group({
            color: ['', Validators.required],
            image: [''],
            sizes: this.fb.array([])
        });
        this.customizableVariantsArray.push(variantGroup);
    }

    removeCustomizableVariant(index: number): void {
        this.customizableVariantsArray.removeAt(index);
    }

    getCustomizableVariantSizes(variantIndex: number): FormArray {
        return this.customizableVariantsArray.at(variantIndex).get('sizes') as FormArray;
    }

    addSizeToCustomizableVariant(variantIndex: number): void {
        const sizeGroup = this.fb.group({
            size: ['', Validators.required],
            stock: [0, [Validators.required, Validators.min(0)]]
        });
        this.getCustomizableVariantSizes(variantIndex).push(sizeGroup);
    }

    removeSizeFromCustomizableVariant(variantIndex: number, sizeIndex: number): void {
        this.getCustomizableVariantSizes(variantIndex).removeAt(sizeIndex);
    }

    getCustomizableProductImage(product: ProductCustomizable): string {
        if (product.variants && product.variants.length > 0 && product.variants[0].image) {
            return product.variants[0].image;
        }
        return '/assets/images/placeholder-product.jpg';
    }

    getColorValue(colorName: string): string {
        const colorMap: { [key: string]: string } = {
            'Blanco': '#FFFFFF',
            'Negro': '#000000',
            'Gris': '#808080',
            'Azul': '#0000FF',
            'Rojo': '#FF0000',
            'Verde': '#008000',
            'Amarillo': '#FFFF00',
            'Naranja': '#FFA500',
            'Rosa': '#FFC0CB',
            'Violeta': '#800080',
            'Marrón': '#A52A2A',
            'Beige': '#F5F5DC'
        };
        return colorMap[colorName] || '#CCCCCC';
    }

    getTotalStock(product: ProductCustomizable): number {
        return product.variants.reduce((total, variant) =>
            total + variant.sizes.reduce((sum, size) => sum + size.stock, 0), 0);
    }

    getVariantTotalStock(variant: any): number {
        return variant.sizes.reduce((sum: number, size: any) => sum + size.stock, 0);
    }

    getCategoryLabel(garmentType: string): string {
        const category = this.garmentTypes.find(type => type.value === garmentType);
        return category ? category.label : garmentType;
    }

} 