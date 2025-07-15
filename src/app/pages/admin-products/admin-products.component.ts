import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Image } from 'primeng/image';
import { Tag } from 'primeng/tag';
import { Producto } from '../../model/product';
import { ProductsService } from '../../services/products.service';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterLink,
        Button,
        Card,
        Dialog,
        InputText,
        InputNumber,
        Checkbox,
        MultiSelect,
        Select,
        Textarea,
        Toast,
        TableModule,
        ConfirmDialog,
        Image,
        Tag
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-products.component.html',
    styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {

    products: Producto[] = [];
    productForm!: FormGroup;
    displayDialog = false;
    editingProduct: Producto | null = null;
    isLoading = false;
    searchQuery = '';
    isMultiselectOpen = false;

    // Options for form
    categories = [
        { label: 'Remeras', value: 'remeras' },
        { label: 'Buzos', value: 'buzos' },
        { label: 'Camisetas', value: 'camisetas' },
        { label: 'Hoodies', value: 'hoodies' },
        { label: 'Accesorios', value: 'accesorios' }
    ];

    availableTags = [
        { label: 'Oversize', value: 'oversize' },
        { label: 'Básico', value: 'basico' },
        { label: 'Estampado', value: 'estampado' },
        { label: 'Liso', value: 'liso' },
        { label: 'Deportivo', value: 'deportivo' },
        { label: 'Casual', value: 'casual' },
        { label: 'Premium', value: 'premium' },
        { label: 'Bordado', value: 'bordado' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private productsService: ProductsService
    ) { }

    ngOnInit() {
        this.loadProducts();
        this.initForm();
    }

    loadProducts() {
        this.isLoading = true;
        this.productsService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.isLoading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los productos: ' + error.message
                });
                this.isLoading = false;
            }
        });
    }

    onFilter(event: any) {
        // This method is called when the table filter is applied
        // The filtering is handled automatically by PrimeNG Table
        console.log('Filter applied:', event);
    }

    onMultiselectShow() {
        // Multiselect is opening - track the state
        this.isMultiselectOpen = true;
        console.log('Multiselect opened');
    }

    onMultiselectHide() {
        // Multiselect is closing - track the state
        this.isMultiselectOpen = false;
        console.log('Multiselect closed');
    }

    initForm(product?: Producto) {
        this.productForm = this.fb.group({
            id: [product?.id || '', Validators.required],
            nombre: [product?.nombre || '', Validators.required],
            descripcion: [product?.descripcion || '', Validators.required],
            precio: [product?.precio || 0, [Validators.required, Validators.min(0)]],
            imagen: [product?.imagen || '', Validators.required],
            stock: [product?.stock || 0, [Validators.required, Validators.min(0)]],
            categoria: [product?.categoria || '', Validators.required],
            tags: [product?.tags || []],
            rating: [product?.rating || 0, [Validators.min(0), Validators.max(5)]],
            descuento: [product?.descuento || 0, [Validators.min(0), Validators.max(100)]],
            esNuevo: [product?.esNuevo || false],
            esDestacado: [product?.esDestacado || false],
            tipo: [product?.tipo || 'bordado']
        });
    }

    openNew() {
        this.editingProduct = null;
        this.initForm();
        this.displayDialog = true;
    }

    editProduct(product: Producto) {
        this.editingProduct = product;
        this.initForm(product);
        this.displayDialog = true;
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

        const productData = this.productForm.value as Producto;
        const newProduct = new Producto(productData);

        if (this.editingProduct) {
            // Update existing product
            this.productsService.updateProduct(newProduct).subscribe({
                next: (updatedProduct) => {
                    const index = this.products.findIndex(p => p.id === updatedProduct.id);
                    if (index !== -1) {
                        // Update the product object with the new form data
                        Object.assign(this.products[index], newProduct);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto actualizado',
                        detail: `El producto "${updatedProduct.nombre}" ha sido actualizado correctamente`
                    });
                    this.displayDialog = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el producto: ' + error.message
                    });
                }
            });
        } else {
            // Add new product
            this.productsService.createProduct(newProduct).subscribe({
                next: (createdProduct) => {
                    this.products.push(createdProduct);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto agregado',
                        detail: `El producto "${createdProduct.nombre}" ha sido agregado correctamente`
                    });
                    this.displayDialog = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear el producto: ' + error.message
                    });
                }
            });
        }
    }

    confirmDelete(product: Producto) {
        this.confirmationService.confirm({
            header: 'Confirmar eliminación',
            message: `¿Estás seguro de que quieres eliminar el producto "${product.nombre}"?`,
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteProduct(product),
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Operación cancelada',
                    detail: 'El producto no fue eliminado'
                });
            }
        });
    }

    deleteProduct(product: Producto) {
        this.productsService.deleteProduct(product.id).subscribe({
            next: () => {
                this.products = this.products.filter(p => p.id !== product.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Producto eliminado',
                    detail: `El producto "${product.nombre}" ha sido eliminado correctamente`
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

    getStockStatus(stock: number): { severity: string; value: string } {
        if (stock === 0) return { severity: 'danger', value: 'Sin stock' };
        if (stock <= 5) return { severity: 'warning', value: 'Últimas unidades' };
        return { severity: 'success', value: 'En stock' };
    }

    getDiscountColor(discount: number): string {
        if (discount >= 30) return 'danger';
        if (discount >= 20) return 'warning';
        return 'success';
    }

    onSort(event: any) {
        // Custom sorting for estado field
        if (event.field === 'estado') {
            this.products.sort((a, b) => {
                const estadoA = a.estado;
                const estadoB = b.estado;

                // Define priority order for estados
                const priority = {
                    'Nuevo y Destacado': 4,
                    'Destacado': 3,
                    'Nuevo': 2,
                    'Regular': 1
                };

                const priorityA = priority[estadoA as keyof typeof priority] || 0;
                const priorityB = priority[estadoB as keyof typeof priority] || 0;

                if (event.order === 1) {
                    return priorityB - priorityA; // Descending
                } else {
                    return priorityA - priorityB; // Ascending
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/']);
    }

} 