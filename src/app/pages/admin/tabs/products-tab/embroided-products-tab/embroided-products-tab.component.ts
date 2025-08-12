import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Image } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FileUpload } from 'primeng/fileupload';
import { ErrorHelperComponent } from '../../../../../shared/error-helper/error-helper.component';
import { ProductEmbroided } from '../../../../../models/product-embroided';
import { ProductsService } from '../../../../../services/products.service';
import { SettingsService } from '../../../../../services/settings.service';
import { Checkbox } from 'primeng/checkbox';
import { Textarea } from 'primeng/textarea';

@Component({
    selector: 'app-embroided-products-tab',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        Button,
        InputText,
        Textarea,
        InputNumber,
        Checkbox,
        Select,
        MultiSelect,
        Dialog,
        Tag,
        Image,
        FileUpload,
        ErrorHelperComponent,
        InputGroup,
        InputGroupAddon
    ],
    providers: [],
    templateUrl: './embroided-products-tab.component.html',
    styleUrl: './embroided-products-tab.component.scss'
})
export class EmbroidedProductsTabComponent implements OnInit {

    // Products Management
    products: ProductEmbroided[] = [];
    productForm!: FormGroup;
    showProductDialog: boolean = false;
    editingProduct: ProductEmbroided | null = null;
    productsLoading: boolean = false;
    savingProduct: boolean = false;
    selectedVariantImageNames: { [key: number]: string } = {};
    maxImageSize: number = 1000000; // Default 1MB

    // Product options
    productCategories = [
        { label: 'Remeras', value: 'remera' },
        { label: 'Buzos', value: 'buzo' },
        { label: 'Camisetas', value: 'camiseta' },
        { label: 'Hoodies', value: 'hoodie' },
        { label: 'Accesorios', value: 'accesorio' }
    ];

    availableProductTags = [
        { label: 'Oversize', value: 'oversize' },
        { label: 'Básico', value: 'basico' },
        { label: 'Estampado', value: 'estampado' },
        { label: 'Liso', value: 'liso' },
        { label: 'Deportivo', value: 'deportivo' },
        { label: 'Casual', value: 'casual' },
        { label: 'Premium', value: 'premium' },
        { label: 'Bordado', value: 'bordado' }
    ];

    availableSizes = [
        { label: 'XS', value: 'XS' },
        { label: 'S', value: 'S' },
        { label: 'M', value: 'M' },
        { label: 'L', value: 'L' },
        { label: 'XL', value: 'XL' },
        { label: 'XXL', value: 'XXL' }
    ];

    availableColors = [
        { label: 'Blanco', value: 'Blanco' },
        { label: 'Negro', value: 'Negro' },
        { label: 'Gris', value: 'Gris' },
        { label: 'Azul', value: 'Azul' },
        { label: 'Rojo', value: 'Rojo' },
        { label: 'Verde', value: 'Verde' },
        { label: 'Amarillo', value: 'Amarillo' },
        { label: 'Rosa', value: 'Rosa' },
        { label: 'Morado', value: 'Morado' },
        { label: 'Naranja', value: 'Naranja' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.loadProducts();
        this.initProductForm();
        this.loadMaxImageSize();
    }

    private initProductForm(): void {
        this.productForm = this.fb.group({
            id: ['', Validators.required],
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            garmentType: ['', Validators.required],
            tags: [[]],
            rating: [0, [Validators.min(0), Validators.max(5)]],
            discount: [0, [Validators.min(0), Validators.max(100)]],
            isNew: [false],
            isFeatured: [false],
            type: ['bordado'],
            variants: this.fb.array([]) // Initialize with empty variants array
        });
    }

    loadProducts() {
        this.productsLoading = true;
        this.productsService.getEmbroidedProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.productsLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos: ' + error.message
                });
                this.productsLoading = false;
            }
        });
    }

    loadMaxImageSize(): void {
        this.settingsService.getMaxImageSize().subscribe({
            next: (maxSize) => {
                this.maxImageSize = maxSize;
            },
            error: (error) => {
                // Keep the default value
            }
        });
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileNameFromPath(filePath: string): string {
        if (!filePath) return '';
        const parts = filePath.split('/');
        return parts[parts.length - 1] || '';
    }

    getVariantImagePath(variantIndex: number): string {
        const variantControl = this.variantsArray.at(variantIndex);
        return variantControl?.get('image')?.value || '';
    }

    openProductDialog(product?: ProductEmbroided) {
        this.editingProduct = product || null;
        this.selectedVariantImageNames = {}; // Reset variant file names
        if (product) {
            // For editing, patch the product data but handle variants separately
            const productData: any = { ...product };

            this.productForm.patchValue(productData);

            // Handle variants separately
            if (product.variants && product.variants.length > 0) {
                // Clear existing variants
                while (this.variantsArray.length !== 0) {
                    this.variantsArray.removeAt(0);
                }

                // Add each variant
                product.variants.forEach((variant, index) => {
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
                isNew: false,
                isFeatured: false,
                type: 'bordado',
                tags: [],
                image: '/prendas/remera_blanca.webp' // Default image
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

    saveProduct() {
        if (this.productForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos'
            });
            return;
        }

        this.savingProduct = true;
        const productData = this.productForm.getRawValue() as ProductEmbroided;
        const newProduct = new ProductEmbroided(productData);

        if (this.editingProduct) {
            // Update existing product
            this.productsService.updateEmbroidedProduct(newProduct).subscribe({
                next: (updatedProduct) => {
                    const index = this.products.findIndex(p => p.id === updatedProduct.id);
                    if (index !== -1) {
                        Object.assign(this.products[index], newProduct);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto actualizado',
                        detail: `El producto ID: ${updatedProduct.id} - ${updatedProduct.name} ha sido actualizado correctamente`
                    });
                    this.showProductDialog = false;
                    this.savingProduct = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el producto: ' + error.message
                    });
                    this.savingProduct = false;
                }
            });
        } else {
            // Add new product
            this.productsService.createEmbroidedProduct(newProduct).subscribe({
                next: (createdProduct) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto creado',
                        detail: `El producto ID: ${createdProduct.id} - "${createdProduct.name}" ha sido creado correctamente`
                    });
                    this.showProductDialog = false;
                    this.savingProduct = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear el producto: ' + error.message
                    });
                    this.savingProduct = false;
                }
            });
        }
    }

    editProduct(product: ProductEmbroided) {
        this.openProductDialog(product);
    }

    confirmDeleteProduct(product: ProductEmbroided) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el producto ID: ${product.id} - ${product.name}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteProduct(product);
            }
        });
    }

    deleteProduct(product: ProductEmbroided) {
        this.productsService.deleteEmbroidedProduct(product.id).subscribe({
            next: () => {
                this.products = this.products.filter(p => p.id !== product.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Producto eliminado',
                    detail: `El producto ID: ${product.id} - ${product.name} ha sido eliminado correctamente`
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

    getDiscountedPrice(product: ProductEmbroided): number {
        if (product.discount > 0) {
            return product.price * (1 - product.discount / 100);
        }
        return product.price;
    }

    getTagLabel(tagValue: string): string {
        const tag = this.availableProductTags.find(t => t.value === tagValue);
        return tag ? tag.label : tagValue;
    }

    getCategoryLabel(categoryValue: string): string {
        const category = this.productCategories.find(c => c.value === categoryValue);
        return category ? category.label : categoryValue;
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
        return colorMap[colorName] || '#CCCCCC'; // Default gray if color not found
    }

    getProductImage(product: ProductEmbroided): string {
        // Return the first variant's image, or a default image if no variants
        return product.variants?.[0]?.image || '/assets/images/default-product.jpg';
    }

    // Getter for variants FormArray
    get variantsArray(): FormArray {
        return this.productForm.get('variants') as FormArray;
    }

    // Add a new variant
    addVariant(): void {
        const variantGroup = this.fb.group({
            color: ['', Validators.required],
            image: [''],
            sizes: this.fb.array([])
        });
        this.variantsArray.push(variantGroup);
    }

    // Remove a variant
    removeVariant(index: number): void {
        this.variantsArray.removeAt(index);
    }

    // Get sizes FormArray for a specific variant
    getVariantSizes(variantIndex: number): FormArray {
        return this.variantsArray.at(variantIndex).get('sizes') as FormArray;
    }

    // Add a size to a specific variant
    addSizeToVariant(variantIndex: number): void {
        const sizeGroup = this.fb.group({
            size: ['', Validators.required],
            stock: [0, [Validators.required, Validators.min(0)]]
        });
        this.getVariantSizes(variantIndex).push(sizeGroup);
    }

    // Remove a size from a specific variant
    removeSizeFromVariant(variantIndex: number, sizeIndex: number): void {
        this.getVariantSizes(variantIndex).removeAt(sizeIndex);
    }

    onVariantImageUpload(event: any, variantIndex: number): void {
        const file = event.files[0];
        if (file) {
            // Check file size
            if (file.size > this.maxImageSize) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de tamaño',
                    detail: `El archivo excede el tamaño máximo permitido de ${this.maxImageSize / 1000000}MB`
                });
                return;
            }

            // Store the file name for display
            this.selectedVariantImageNames[variantIndex] = file.name;

            // Save just the file path instead of Base64 data
            const filePath = `/uploads/${file.name}`;
            this.variantsArray.at(variantIndex).get('image')?.setValue(filePath);
        }
    }

    clearVariantImage(variantIndex: number): void {
        this.variantsArray.at(variantIndex).get('image')?.setValue('');
        delete this.selectedVariantImageNames[variantIndex];
        this.messageService.add({
            severity: 'info',
            summary: 'Imagen eliminada',
            detail: 'La imagen de la variante ha sido eliminada'
        });
    }

    onImageError(event: any, product: ProductEmbroided | undefined): void {
        // Update the image source to show default image
        const imgElement = event.target as HTMLImageElement;
        if (imgElement) {
            imgElement.src = 'sin_imagen.png';
            imgElement.alt = `${product?.name || ''}`;
        }
    }

}
