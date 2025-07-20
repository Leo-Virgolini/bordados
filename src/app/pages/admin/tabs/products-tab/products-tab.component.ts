import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Product } from '../../../../model/product';
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
            stock: [0, [Validators.required, Validators.min(0)]],
            category: ['', Validators.required],
            garmentType: ['', Validators.required],
            size: ['', Validators.required],
            garmentColor: ['', Validators.required],
            tags: [[]],
            rating: [0, [Validators.min(0), Validators.max(5)]],
            discount: [0, [Validators.min(0), Validators.max(100)]],
            isNew: [false],
            isFeatured: [false],
            type: ['bordado']
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
            this.productForm.patchValue(product);
        } else {
            this.productForm.reset({
                isNew: false,
                isFeatured: false,
                type: 'bordado',
                tags: []
            });
        }
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
        const productData = this.productForm.value as Product;
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
                        detail: `El producto "${updatedProduct.name}" ha sido actualizado correctamente`
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
                    this.products.push(createdProduct);
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
            message: `¿Estás seguro de eliminar el producto "${product.name}"?`,
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
                    detail: `El producto "${product.name}" ha sido eliminado correctamente`
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

} 
