import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Slider } from 'primeng/slider';
import { Paginator } from 'primeng/paginator';
import { Tag } from 'primeng/tag';
import { Badge } from 'primeng/badge';
import { Divider } from 'primeng/divider';
import { Image } from 'primeng/image';
import { Tooltip } from 'primeng/tooltip';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { Checkbox } from 'primeng/checkbox';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CarritoService } from '../../services/carrito.service';
import { SortOption } from '../../model/sort-option';
import { ProductsService } from '../../services/products.service';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { Product } from '../../model/product';
import { CartItem } from '../../model/cart-item';

@Component({
    selector: 'app-products-sale',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InputText,
        Button,
        Card,
        Select,
        MultiSelect,
        Slider,
        Paginator,
        Tag,
        Badge,
        Divider,
        Image,
        Tooltip,
        AnimateOnScrollModule,
        Checkbox,
        ProgressSpinner,
        ConfirmPopup,
        Toast,
        InputGroup,
        InputGroupAddon,
        InputNumber
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './products-sale.component.html',
    styleUrl: './products-sale.component.scss'
})
export class ProductsSaleComponent implements OnInit {

    // Form
    filtersForm!: FormGroup;

    // Products data
    allProducts: Product[] = [];
    filteredProducts: Product[] = [];
    displayedProducts: Product[] = [];
    isLoading: boolean = false;
    selectedProduct: Product | null = null;
    selectedQuantity: number = 1;
    loadingProducts: Set<string> = new Set(); // Track which products are being added to cart

    // Pagination
    first: number = 0;
    rows: number = 16;
    totalRecords: number = 0;

    // Options for filters
    categories: SortOption[] = [
        new SortOption('Remeras', 'remeras'),
        new SortOption('Buzos', 'buzos'),
        new SortOption('Camisetas', 'camisetas'),
        new SortOption('Hoodies', 'hoodies'),
        new SortOption('Accesorios', 'accesorios')
    ];

    tags: SortOption[] = [
        new SortOption('Oversize', 'oversize'),
        new SortOption('Básico', 'basico'),
        new SortOption('Estampado', 'estampado'),
        new SortOption('Liso', 'liso'),
        new SortOption('Deportivo', 'deportivo'),
        new SortOption('Casual', 'casual'),
        new SortOption('Premium', 'premium')
    ];

    // Removed product types filter since this component only shows pre-embroidered products

    sortOptions: SortOption[] = [
        new SortOption('Nombre A-Z', 'name-asc'),
        new SortOption('Nombre Z-A', 'name-desc'),
        new SortOption('Precio Menor a Mayor', 'price-asc'),
        new SortOption('Precio Mayor a Menor', 'price-desc'),
        new SortOption('Descuento Mayor', 'discount-desc'),
        new SortOption('Más Nuevos', 'newest'),
        new SortOption('Más Populares', 'rating-desc')
    ];

    constructor(
        private carritoService: CarritoService,
        private productsService: ProductsService,
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.initForm();
        this.loadProducts();
        this.applyFilters();
    }

    private initForm(): void {
        this.filtersForm = this.fb.group({
            searchTerm: [''],
            selectedCategories: [[]],
            selectedTags: [[]],
            priceRange: [[0, 50000]],
            selectedSort: ['name-asc'],
            showOnlyNew: [false],
            showOnlyFeatured: [false],
            minStock: [0]
        });

        // Subscribe to form changes
        this.filtersForm.valueChanges.subscribe(() => {
            this.applyFilters();
        });
    }

    private loadProducts(): void {
        this.isLoading = true;
        this.productsService.getProducts().subscribe({
            next: (products) => {
                // Filter only pre-embroidered products (type === 'bordado')
                this.allProducts = products.filter(product => product.type === 'bordado');
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.allProducts];
        const formValue = this.filtersForm.value;

        // Search filter
        if (formValue.searchTerm.trim()) {
            const search = formValue.searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search) ||
                product.tags.some((tag: string) => tag.toLowerCase().includes(search))
            );
        }

        // Category filter
        if (formValue.selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                formValue.selectedCategories.includes(product.category)
            );
        }

        // Tags filter
        if (formValue.selectedTags.length > 0) {
            filtered = filtered.filter(product =>
                formValue.selectedTags.some((tag: string) => product.tags.includes(tag))
            );
        }

        // Price range filter
        filtered = filtered.filter(product =>
            product.price >= formValue.priceRange[0] && product.price <= formValue.priceRange[1]
        );

        // New products filter
        if (formValue.showOnlyNew) {
            filtered = filtered.filter(product => product.isNew);
        }

        // Featured products filter
        if (formValue.showOnlyFeatured) {
            filtered = filtered.filter(product => product.isFeatured);
        }

        // Stock filter
        filtered = filtered.filter(product => product.stock >= formValue.minStock);

        // Sort products
        this.sortProducts(filtered, formValue.selectedSort);

        this.filteredProducts = filtered;
        this.totalRecords = filtered.length;

        // Reset pagination to first page when filters change
        this.first = 0;
        this.updateDisplayedProducts();
    }

    private sortProducts(products: Product[], selectedSort: string): void {
        switch (selectedSort) {
            case 'name-asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'discount-desc':
                products.sort((a, b) => b.discount - a.discount);
                break;
            case 'newest':
                products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case 'rating-desc':
                products.sort((a, b) => b.rating - a.rating);
                break;
        }
    }

    onPageChange(event: any): void {
        this.first = event.first;
        this.rows = event.rows;
        this.updateDisplayedProducts();

        // Scroll to beginning of products section when page changes
        setTimeout(() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
                const headerHeight = 80; // Approximate header height
                const elementTop = productsSection.offsetTop - headerHeight;
                window.scrollTo({ top: elementTop, behavior: 'smooth' });
            }
        }, 50);
    }

    private updateDisplayedProducts(): void {
        this.displayedProducts = this.filteredProducts.slice(this.first, this.first + this.rows);
    }

    clearFilters(): void {
        this.filtersForm.patchValue({
            searchTerm: '',
            selectedCategories: [],
            selectedTags: [],
            priceRange: [0, 50000],
            selectedSort: 'name-asc',
            showOnlyNew: false,
            showOnlyFeatured: false,
            minStock: 0
        });
        this.first = 0;
    }

    onSearch(): void {
        // Trigger search by applying filters
        this.applyFilters();

        // Show toast message
        const searchTerm = this.filtersForm.get('searchTerm')?.value;
        if (searchTerm && searchTerm.trim()) {
            this.messageService.add({
                severity: 'info',
                summary: 'Búsqueda realizada',
                detail: `Buscando: "${searchTerm}"`,
                life: 2000
            });
        }
    }

    addToCart(event: Event, product: Product): void {
        this.selectedProduct = product;
        this.selectedQuantity = 1; // Reset quantity to 1 for each new product

        // Close any existing popup first to ensure proper repositioning
        this.confirmationService.close();

        // Use setTimeout to ensure the previous popup is fully closed
        setTimeout(() => {
            this.confirmationService.confirm({
                target: event.target as EventTarget,
                message: `¿Agregar ${product.name} al carrito?`,
                icon: 'pi pi-shopping-cart',
                acceptLabel: 'Agregar',
                acceptIcon: 'pi pi-cart-plus',
                acceptButtonStyleClass: 'p-button-primary',
                rejectLabel: 'Cancelar',
                rejectIcon: 'pi pi-times',
                rejectButtonStyleClass: 'p-button-secondary',
                accept: () => {
                    // Validate quantity
                    if (this.selectedQuantity < 1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Cantidad inválida',
                            detail: 'La cantidad debe ser al menos 1',
                            life: 3000
                        });
                        return;
                    }

                    if (this.selectedQuantity > product.stock) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Stock insuficiente',
                            detail: `Solo hay ${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'} disponible${product.stock === 1 ? '' : 's'}`,
                            life: 3000
                        });
                        return;
                    }

                    // Check if adding this quantity would exceed available stock
                    const currentCartQuantity = this.carritoService.getCartItemQuantity(product.id);
                    const totalQuantity = currentCartQuantity + this.selectedQuantity;

                    if (totalQuantity > product.stock) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Stock insuficiente',
                            detail: `Ya tienes ${currentCartQuantity} en el carrito. ${currentCartQuantity === product.stock ? 'No puedes agregar más' : `Solo puedes agregar ${product.stock - currentCartQuantity} más.`}`,
                            life: 3000
                        });
                        return;
                    }

                    // Add loading state for this specific product
                    this.loadingProducts.add(product.id);

                    // Simulate API call delay
                    setTimeout(() => {
                        this.carritoService.agregarItem(new CartItem({
                            product: product,
                            quantity: this.selectedQuantity
                        }));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Producto agregado',
                            detail: `'${product.name}' x ${this.selectedQuantity} agregado al carrito`,
                            icon: 'pi pi-cart-plus',
                            life: 3000
                        });

                        // Remove loading state
                        this.loadingProducts.delete(product.id);
                        this.selectedProduct = null;
                        this.selectedQuantity = 1;
                    }, 1000); // 1 second delay to show loading
                },
                reject: () => {
                    this.selectedProduct = null;
                    this.selectedQuantity = 1;
                }
            });
        }, 100); // Small delay to ensure proper repositioning
    }

    isProductLoading(productId: string): boolean {
        return this.loadingProducts.has(productId);
    }

    getDiscountColor(discount: number): string {
        if (discount >= 30) return 'success';
        if (discount >= 20) return 'warn';
        return 'success';
    }

    getStockStatus(stock: number): { severity: string; value: string } {
        if (stock === 0) return { severity: 'danger', value: 'Sin stock' };
        if (stock <= 5) return { severity: 'warn', value: 'Últimas unidades' };
        return { severity: 'success', value: 'En stock' };
    }

    getRandomReviews(rating: number): number {
        return Math.floor(Math.random() * (100 - rating) + rating);
    }

    getActualPage(): number {
        return Math.floor(this.first / this.rows) + 1;
    }

    getTotalPages(): number {
        return Math.ceil(this.totalRecords / this.rows);
    }

    getDiscountedPrice(product: Product): number {
        if (product.discount > 0) {
            return product.price * (1 - product.discount / 100);
        }
        return product.price;
    }

} 
