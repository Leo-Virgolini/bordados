import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormGroup as FormGroupType } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Components
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Image } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ErrorHelperComponent } from '../../../../shared/error-helper/error-helper.component';
import { Product } from '../../../../models/product';
import { ProductsService } from '../../../../services/products.service';
import { Checkbox } from 'primeng/checkbox';
import { Textarea } from 'primeng/textarea';

@Component({
    selector: 'app-products-tab',
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
        Card,
        Tag,
        Image,
        ErrorHelperComponent,
        InputGroup,
        InputGroupAddon
    ],
    providers: [],
    templateUrl: './products-tab.component.html',
    styleUrl: './products-tab.component.scss'
})
export class ProductsTabComponent implements OnInit {

    // Products Management
    products: Product[] = [];
    productForm!: FormGroup;
    showProductDialog: boolean = false;
    editingProduct: Product | null = null;
    productsLoading: boolean = false;
    savingProduct: boolean = false;

    // Product options
    productCategories = [
        { label: 'Remeras', value: 'remeras' },
        { label: 'Buzos', value: 'buzos' },
        { label: 'Camisetas', value: 'camisetas' },
        { label: 'Hoodies', value: 'hoodies' },
        { label: 'Accesorios', value: 'accesorios' }
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

    garmentTypes = [
        { label: 'Remera', value: 'remera' },
        { label: 'Buzo', value: 'buzo' },
        { label: 'Camiseta', value: 'camiseta' },
        { label: 'Hoodie', value: 'hoodie' },
        { label: 'Accesorio', value: 'accesorio' }
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
        { label: 'Naranja', value: 'Naranja' },
        { label: 'Rosa', value: 'Rosa' },
        { label: 'Violeta', value: 'Violeta' },
        { label: 'Marrón', value: 'Marrón' },
        { label: 'Beige', value: 'Beige' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService
    ) { }

    ngOnInit() {
        this.loadProducts();
        this.initProductForm();
    }

    private initProductForm(): void {
        this.productForm = this.fb.group({
            id: ['', Validators.required],
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            image: ['', Validators.required],
            category: ['', Validators.required],
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
        this.productsService.getProducts().subscribe({
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

    openProductDialog(product?: Product) {
        this.editingProduct = product || null;
        if (product) {
            // For editing, patch the product data but handle variants separately
            const productData: any = { ...product };

            // Set the main image to the first variant's image if available
            if (product.variants && product.variants.length > 0 && product.variants[0].image) {
                productData.image = product.variants[0].image;
            }

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
        const productData = this.productForm.getRawValue() as Product;
        const newProduct = new Product(productData);

        if (this.editingProduct) {
            // Update existing product
            this.productsService.updateProduct(newProduct).subscribe({
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
            this.productsService.createProduct(newProduct).subscribe({
                next: (createdProduct) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto creado',
                        detail: `El producto "${createdProduct.name}" ha sido creado correctamente`
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

    editProduct(product: Product) {
        this.openProductDialog(product);
    }

    confirmDeleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el producto ID: ${product.id} - ${product.name}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteProduct(product);
            }
        });
    }

    deleteProduct(product: Product) {
        this.productsService.deleteProduct(product.id).subscribe({
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

    onSort(event: any) {
        // Handle sorting if needed
        console.log('Sort event:', event);
    }

    getProductStockStatus(stock: number): { severity: string; value: string } {
        if (stock === 0) return { severity: 'danger', value: 'Sin stock' };
        if (stock <= 10) return { severity: 'warn', value: 'Stock bajo' };
        return { severity: 'success', value: 'En stock' };
    }

    getDiscountedPrice(product: Product): number {
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

    getProductImage(product: Product): string {
        // Return the first variant's image, or a default image if no variants
        return product.variants?.[0]?.image || '/assets/images/default-product.jpg';
    }

    getTotalStock(product: Product): number {
        // Calculate total stock across all variants and sizes
        return product.variants?.reduce((total, variant) => {
            return total + (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0);
        }, 0) || 0;
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

    showVariantsDetails(product: Product): void {
        // Create a detailed message showing all variants
        let detailsMessage = `<div class="flex flex-column gap-3">`;
        detailsMessage += `<h4 class="font-semibold mb-2">${product.name} - Variantes Detalladas</h4>`;

        product.variants?.forEach((variant, index) => {
            detailsMessage += `<div class="surface-50 p-3 border-round">`;
            detailsMessage += `<div class="flex align-items-center gap-2 mb-2">`;
            detailsMessage += `<div class="w-1rem h-1rem border-circle border-1 border-gray-300" style="background-color: ${this.getColorValue(variant.color)}"></div>`;
            detailsMessage += `<span class="font-semibold">${variant.color}</span>`;
            detailsMessage += `</div>`;

            if (variant.sizes && variant.sizes.length > 0) {
                detailsMessage += `<div class="flex flex-wrap gap-2">`;
                variant.sizes.forEach(sizeStock => {
                    const stockClass = sizeStock.stock === 0 ? 'text-red-500' : sizeStock.stock <= 5 ? 'text-orange-500' : 'text-green-500';
                    detailsMessage += `<div class="flex flex-column align-items-center surface-100 p-2 border-round">`;
                    detailsMessage += `<span class="font-bold text-sm">${sizeStock.size}</span>`;
                    detailsMessage += `<span class="text-sm ${stockClass}">${sizeStock.stock} unidades</span>`;
                    detailsMessage += `</div>`;
                });
                detailsMessage += `</div>`;
            }
            detailsMessage += `</div>`;
        });

        detailsMessage += `</div>`;

        this.confirmationService.confirm({
            message: detailsMessage,
            header: 'Detalles de Variantes',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Cerrar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-primary',
            rejectVisible: false
        });
    }

} 
