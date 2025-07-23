import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Image } from 'primeng/image';
import { Toast } from 'primeng/toast';
import { ErrorHelperComponent } from '../../../../../shared/error-helper/error-helper.component';
import { ProductsService } from '../../../../../services/products.service';
import { ProductCustomizable } from '../../../../../model/product-customizable';
import { Product } from '../../../../../model/product';

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
        Textarea,
        Select,
        Image,
        Toast,
        ErrorHelperComponent
    ],
    providers: [],
    templateUrl: './product-types-tab.component.html',
    styleUrl: './product-types-tab.component.scss'
})
export class ProductTypesTabComponent implements OnInit {

    customizableProducts: ProductCustomizable[] = [];
    productForm!: FormGroup;
    showProductDialog: boolean = false;
    editingProduct: ProductCustomizable | null = null;
    productLoading: boolean = false;
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
        this.initForm();
        this.initAvailableOptions();
    }

    private loadCustomizableProducts(): void {
        this.productsService.getCustomizableProducts().subscribe({
            next: (products: ProductCustomizable[]) => {
                this.customizableProducts = products;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos personalizables: ' + error.message
                });
            }
        });
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

    private initForm(): void {
        this.productForm = this.fb.group({
            id: ['', Validators.required],
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            garmentType: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            type: ['personalizable'],
            variants: this.fb.array([])
        });
    }

    get variantsArray(): FormArray {
        return this.productForm.get('variants') as FormArray;
    }

    openProductDialog(product?: ProductCustomizable): void {
        this.editingProduct = product || null;

        if (product) {
            // For editing, patch the product data
            const productData: any = { ...product };

            this.productForm.patchValue(productData);

            // Handle variants separately
            if (product.variants && product.variants.length > 0) {
                // Clear existing variants
                while (this.variantsArray.length !== 0) {
                    this.variantsArray.removeAt(0);
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

                    this.variantsArray.push(variantGroup);
                });
            }

            this.productForm.get('id')?.setValidators([Validators.required]);
            this.productForm.get('id')?.disable();
        } else {
            // For new products, reset with defaults
            this.productForm.reset({
                type: 'personalizable'
            });

            // Clear variants
            while (this.variantsArray.length !== 0) {
                this.variantsArray.removeAt(0);
            }

            this.productForm.get('id')?.clearValidators();
            this.productForm.get('id')?.enable();
        }

        this.productForm.get('id')?.updateValueAndValidity();
        this.showProductDialog = true;
    }

    addVariant(): void {
        const variantGroup = this.fb.group({
            color: ['', Validators.required],
            image: [''],
            sizes: this.fb.array([])
        });
        this.variantsArray.push(variantGroup);
    }

    removeVariant(index: number): void {
        this.variantsArray.removeAt(index);
    }

    addSizeToVariant(variantIndex: number): void {
        const variant = this.variantsArray.at(variantIndex);
        const sizesArray = variant.get('sizes') as FormArray;
        const sizeGroup = this.fb.group({
            size: ['', Validators.required],
            stock: [0, [Validators.required, Validators.min(0)]]
        });
        sizesArray.push(sizeGroup);
    }

    removeSizeFromVariant(variantIndex: number, sizeIndex: number): void {
        const variant = this.variantsArray.at(variantIndex);
        const sizesArray = variant.get('sizes') as FormArray;
        sizesArray.removeAt(sizeIndex);
    }

    getVariantSizes(variantIndex: number): FormArray {
        const variant = this.variantsArray.at(variantIndex);
        return variant.get('sizes') as FormArray;
    }

    saveProduct(): void {
        if (this.productForm.valid && this.variantsArray.length > 0) {
            // Additional validation: check if all variants have sizes
            let allVariantsValid = true;
            for (let i = 0; i < this.variantsArray.length; i++) {
                const variant = this.variantsArray.at(i);
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

            this.productLoading = true;
            const formValue = this.productForm.value;

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
                id: this.editingProduct ? this.editingProduct.id : formValue.id,
                name: formValue.name,
                description: formValue.description,
                garmentType: formValue.garmentType,
                price: formValue.price,
                type: formValue.type,
                variants: variants
            });

            if (this.editingProduct) {
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
                        this.showProductDialog = false;
                        this.editingProduct = null;
                        this.productLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar el producto: ' + error.message
                        });
                        this.productLoading = false;
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
                        this.showProductDialog = false;
                        this.editingProduct = null;
                        this.productLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el producto: ' + error.message
                        });
                        this.productLoading = false;
                    }
                });
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'Por favor completa todos los campos requeridos y agrega al menos una variante'
            });
        }
    }

    deleteProduct(product: ProductCustomizable): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el producto "${product.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
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
        });
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

    getProductImage(product: ProductCustomizable): string {
        if (product.variants && product.variants.length > 0 && product.variants[0].image) {
            return product.variants[0].image;
        }
        return product.customImage || '/prendas/remera_blanca.webp';
    }

    getTotalStock(product: ProductCustomizable): number {
        return product.variants.reduce((total, variant) =>
            total + variant.sizes.reduce((sum, size) => sum + size.stock, 0), 0);
    }

    getVariantTotalStock(variant: any): number {
        return variant.sizes.reduce((sum: number, size: any) => sum + size.stock, 0);
    }

    getSizeControl(variantIndex: number, sizeIndex: number): FormControl {
        const variant = this.variantsArray.at(variantIndex);
        const sizesArray = variant.get('sizes') as FormArray;
        return sizesArray.at(sizeIndex).get('size') as FormControl;
    }

    getStockControl(variantIndex: number, sizeIndex: number): FormControl {
        const variant = this.variantsArray.at(variantIndex);
        const sizesArray = variant.get('sizes') as FormArray;
        return sizesArray.at(sizeIndex).get('stock') as FormControl;
    }
} 