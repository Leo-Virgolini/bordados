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
import { CarritoItem } from '../../model/carrito-item';
import { Producto } from '../../model/product';
import { Category } from '../../model/category';
import { SortOption } from '../../model/sort-option';
import { ProductsService } from '../../services/products.service';
import { InputGroup } from 'primeng/inputgroup';

@Component({
    selector: 'app-products-sale',
    imports: [
        CommonModule,
        ReactiveFormsModule,
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
        InputGroup
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './products-sale.component.html',
    styleUrl: './products-sale.component.scss'
})
export class ProductsSaleComponent implements OnInit {

    // Form
    filtersForm!: FormGroup;

    // Products data
    allProducts: Producto[] = [];
    filteredProducts: Producto[] = [];
    displayedProducts: Producto[] = [];
    isLoading: boolean = false;
    selectedProduct: Producto | null = null;
    loadingProducts: Set<string> = new Set(); // Track which products are being added to cart

    // Pagination
    first: number = 0;
    rows: number = 16;
    totalRecords: number = 0;

    // Options for filters
    categories: Category[] = [
        new Category('Remeras', 'remeras'),
        new Category('Buzos', 'buzos'),
        new Category('Camisetas', 'camisetas'),
        new Category('Hoodies', 'hoodies'),
        new Category('Accesorios', 'accesorios')
    ];

    tags: Category[] = [
        new Category('Oversize', 'oversize'),
        new Category('Básico', 'basico'),
        new Category('Estampado', 'estampado'),
        new Category('Liso', 'liso'),
        new Category('Deportivo', 'deportivo'),
        new Category('Casual', 'casual'),
        new Category('Premium', 'premium')
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
                // Filter only pre-embroidered products (tipo === 'bordado')
                this.allProducts = products.filter(product => product.tipo === 'bordado');
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
                product.nombre.toLowerCase().includes(search) ||
                product.descripcion.toLowerCase().includes(search) ||
                product.tags.some((tag: string) => tag.toLowerCase().includes(search))
            );
        }

        // Category filter
        if (formValue.selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                formValue.selectedCategories.includes(product.categoria)
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
            product.precio >= formValue.priceRange[0] && product.precio <= formValue.priceRange[1]
        );

        // New products filter
        if (formValue.showOnlyNew) {
            filtered = filtered.filter(product => product.esNuevo);
        }

        // Featured products filter
        if (formValue.showOnlyFeatured) {
            filtered = filtered.filter(product => product.esDestacado);
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

    private sortProducts(products: Producto[], selectedSort: string): void {
        switch (selectedSort) {
            case 'name-asc':
                products.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'name-desc':
                products.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            case 'price-asc':
                products.sort((a, b) => a.precio - b.precio);
                break;
            case 'price-desc':
                products.sort((a, b) => b.precio - a.precio);
                break;
            case 'discount-desc':
                products.sort((a, b) => b.descuento - a.descuento);
                break;
            case 'newest':
                products.sort((a, b) => (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0));
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

    addToCart(event: Event, product: Producto): void {
        this.selectedProduct = product;
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `¿Agregar?`,
            icon: 'pi pi-shopping-cart',
            acceptLabel: 'Agregar',
            acceptIcon: 'pi pi-cart-plus',
            acceptButtonStyleClass: 'p-button-primary',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                // Add loading state for this specific product
                this.loadingProducts.add(product.id);

                // Simulate API call delay
                setTimeout(() => {
                    this.carritoService.agregarItem(new CarritoItem({
                        producto: product,
                        cantidad: 1
                    }));
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Producto agregado',
                        detail: `${product.nombre} se agregó al carrito`,
                        icon: 'pi pi-cart-plus',
                        life: 3000
                    });

                    // Remove loading state
                    this.loadingProducts.delete(product.id);
                    this.selectedProduct = null;
                }, 1000); // 1 second delay to show loading
            },
            reject: () => {
                this.selectedProduct = null;
            }
        });
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
        if (stock <= 5) return { severity: 'warning', value: 'Últimas unidades' };
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

    getDiscountedPrice(product: Producto): number {
        if (product.descuento > 0) {
            return product.precio * (1 - product.descuento / 100);
        }
        return product.precio;
    }

} 