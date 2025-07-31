import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Slider } from 'primeng/slider';
import { Paginator } from 'primeng/paginator';
import { Tag } from 'primeng/tag';
import { Image } from 'primeng/image';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { Checkbox } from 'primeng/checkbox';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CarritoService } from '../../services/carrito.service';
import { SortOption } from '../../models/sort-option';
import { ProductsService } from '../../services/products.service';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ProductEmbroided } from '../../models/product-embroided';
import { CartItem } from '../../models/cart-item';

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
        Image,
        AnimateOnScrollModule,
        Checkbox,
        ProgressSpinner,
        ConfirmPopup,
        Toast,
        InputGroup,
        InputGroupAddon,
        InputNumber
    ],
    providers: [],
    templateUrl: './products-sale.component.html',
    styleUrl: './products-sale.component.scss'
})
export class ProductsSaleComponent implements OnInit {

    // Form
    filtersForm!: FormGroup;
    productSelectionForm!: FormGroup;

    // Products data
    allProducts: ProductEmbroided[] = [];
    filteredProducts: ProductEmbroided[] = [];
    displayedProducts: ProductEmbroided[] = [];
    isLoading: boolean = false;
    selectedProduct: ProductEmbroided | null = null;
    loadingProducts: Set<number> = new Set(); // Track which products are being added to cart

    // Pagination
    first: number = 0;
    rows: number = 16;
    totalRecords: number = 0;

    // Options for filters
    categories: SortOption[] = [
        new SortOption('Remeras', 'remera'),
        new SortOption('Buzos', 'buzo'),
        new SortOption('Camisetas', 'camiseta'),
        new SortOption('Hoodies', 'hoodie'),
        new SortOption('Accesorios', 'accesorio')
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
            priceRange: [[0, 150000]],
            selectedSort: ['name-asc'],
            showOnlyNew: [false],
            showOnlyFeatured: [false],
            minStock: [0]
        });

        this.productSelectionForm = this.fb.group({
            selectedColor: [''],
            selectedSize: [''],
            selectedQuantity: [1, [Validators.required, Validators.min(1)]]
        });

        // Subscribe to form changes
        this.filtersForm.valueChanges.subscribe(() => {
            this.applyFilters();
        });
    }

    private loadProducts(): void {
        this.isLoading = true;
        this.productsService.getEmbroidedProducts().subscribe({
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
                formValue.selectedCategories.includes(product.garmentType)
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
        filtered = filtered.filter(product => this.getDisplayedVariantStock(product) >= formValue.minStock);

        // Sort products
        this.sortProducts(filtered, formValue.selectedSort);

        this.filteredProducts = filtered;
        this.totalRecords = filtered.length;

        // Reset pagination to first page when filters change
        this.first = 0;
        this.updateDisplayedProducts();
    }

    private sortProducts(products: ProductEmbroided[], selectedSort: string): void {
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

    addToCart(event: Event, product: ProductEmbroided): void {
        this.selectedProduct = product;
        // Reset form values
        this.productSelectionForm.patchValue({
            selectedColor: '',
            selectedSize: '',
            selectedQuantity: 1
        });

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
                    const selectedColor = this.productSelectionForm.get('selectedColor')?.value;
                    const selectedSize = this.productSelectionForm.get('selectedSize')?.value;
                    const selectedQuantity = this.productSelectionForm.get('selectedQuantity')?.value;

                    // Validate color and size selection
                    if (!selectedColor) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Color requerido',
                            detail: 'Debes seleccionar un color',
                            life: 3000
                        });
                        return;
                    }

                    if (!selectedSize) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Talle requerido',
                            detail: 'Debes seleccionar un talle',
                            life: 3000
                        });
                        return;
                    }

                    // Validate quantity
                    if (selectedQuantity < 1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Cantidad inválida',
                            detail: 'La cantidad debe ser al menos 1',
                            life: 3000
                        });
                        return;
                    }

                    const availableStock = this.getStockForColorAndSize(product, selectedColor, selectedSize);
                    if (selectedQuantity > availableStock) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Stock insuficiente',
                            detail: `Solo hay ${availableStock} ${availableStock === 1 ? 'unidad' : 'unidades'} disponible${availableStock === 1 ? '' : 's'} para ${selectedColor} - T: ${selectedSize}`,
                            life: 3000
                        });
                        return;
                    }

                    // Check if adding this quantity would exceed available stock
                    const currentCartQuantity = this.carritoService.getCartItemQuantityForVariant(product.id, selectedColor, selectedSize);
                    const totalQuantity = currentCartQuantity + selectedQuantity;

                    if (totalQuantity > availableStock) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Stock insuficiente',
                            detail: `Ya tienes ${currentCartQuantity} x '${product.name}' ${selectedColor} - T: ${selectedSize}. ${currentCartQuantity === availableStock ? 'No puedes agregar más' : `Solo puedes agregar ${availableStock - currentCartQuantity} más.`}`,
                            life: 3000
                        });
                        return;
                    }

                    // Add loading state for this specific product
                    this.loadingProducts.add(product.id);

                    // Create a product with only the selected variant and size
                    const selectedVariant = product.variants?.find(v => v.color === selectedColor);
                    const selectedSizeStock = selectedVariant?.sizes?.find(s => s.size === selectedSize);

                    if (!selectedVariant || !selectedSizeStock) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo encontrar la variante seleccionada',
                            life: 3000
                        });
                        return;
                    }

                    const productWithSelectedVariant = new ProductEmbroided({
                        ...product,
                        variants: [{
                            color: selectedVariant.color,
                            image: selectedVariant.image,
                            sizes: [selectedSizeStock]
                        }]
                    });

                    this.carritoService.agregarItem(new CartItem({
                        product: productWithSelectedVariant,
                        quantity: selectedQuantity
                    }));
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Producto agregado',
                        detail: `'${product.name}' ${selectedColor} - T: ${selectedSize} x ${selectedQuantity} agregado al carrito`,
                        icon: 'pi pi-cart-plus',
                        life: 3000
                    });

                    // Remove loading state
                    this.loadingProducts.delete(product.id);
                    this.selectedProduct = null;
                    // Reset form
                    this.productSelectionForm.patchValue({
                        selectedColor: '',
                        selectedSize: '',
                        selectedQuantity: 1
                    });

                },
                reject: () => {
                    this.selectedProduct = null;
                    // Reset form
                    this.productSelectionForm.patchValue({
                        selectedColor: '',
                        selectedSize: '',
                        selectedQuantity: 1
                    });
                }
            });
        }, 100); // Small delay to ensure proper repositioning
    }

    isProductLoading(productId: number): boolean {
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

    getDiscountedPrice(product: ProductEmbroided): number {
        if (product.discount > 0) {
            return product.price * (1 - product.discount / 100);
        }
        return product.price;
    }

    getTotalStock(product: ProductEmbroided): number {
        return product.variants?.reduce((sum, variant) =>
            sum + (variant.sizes?.reduce((s, sz) => s + (sz.stock || 0), 0) || 0), 0
        ) || 0;
    }

    getDisplayedVariantStock(product: ProductEmbroided): number {
        const firstVariant = product.variants?.[0];
        if (!firstVariant || !firstVariant.sizes || firstVariant.sizes.length === 0) {
            return 0;
        }

        // Get the stock for the first size being displayed
        return firstVariant.sizes[0].stock || 0;
    }

    getFirstColor(product: ProductEmbroided): string {
        return product.variants?.[0]?.color || '-';
    }

    getFirstSize(product: ProductEmbroided): string {
        return product.variants?.[0]?.sizes?.[0]?.size || '-';
    }

    getAvailableColors(product: ProductEmbroided): { label: string, value: string }[] {
        return product.variants
            ?.filter(variant => {
                // Only include variants that have at least one size with stock > 0
                return variant.sizes?.some(sizeStock => sizeStock.stock > 0);
            })
            .map(variant => ({
                label: variant.color,
                value: variant.color
            })) || [];
    }

    getAvailableSizes(product: ProductEmbroided, color?: string): { label: string, value: string }[] {
        console.log('getAvailableSizes called with:', { productId: product.id, color, productVariants: product.variants });

        if (!color) {
            console.log('No color provided, returning empty array');
            return [];
        }

        const variant = product.variants?.find(v => v.color === color);
        console.log('Found variant:', variant);

        if (!variant || !variant.sizes) {
            console.log('No variant or sizes found, returning empty array');
            return [];
        }

        // Order sizes from smallest to largest
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const availableSizes = variant.sizes
            .filter(sizeStock => sizeStock.stock > 0)
            .sort((a, b) => {
                const idxA = sizeOrder.indexOf(a.size);
                const idxB = sizeOrder.indexOf(b.size);
                if (idxA === -1 && idxB === -1) return a.size.localeCompare(b.size);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            })
            .map(sizeStock => ({
                label: sizeStock.size,
                value: sizeStock.size
            }));

        console.log('Available sizes for color', color, ':', availableSizes);
        return availableSizes;
    }

    getAllAvailableSizes(product: ProductEmbroided): { label: string, value: string }[] {
        if (!product.variants) {
            return [];
        }

        // Collect all unique sizes with stock across all variants
        const sizeSet = new Set<string>();
        product.variants.forEach(variant => {
            if (variant.sizes) {
                variant.sizes.forEach(sizeStock => {
                    if (sizeStock.stock > 0) {
                        sizeSet.add(sizeStock.size);
                    }
                });
            }
        });

        // Order sizes from smallest to largest
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return Array.from(sizeSet)
            .sort((a, b) => {
                const idxA = sizeOrder.indexOf(a);
                const idxB = sizeOrder.indexOf(b);
                if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            })
            .map(size => ({
                label: size,
                value: size
            }));
    }

    getStockForColorAndSize(product: ProductEmbroided, color: string, size: string): number {
        const variant = product.variants?.find(v => v.color === color);
        if (!variant || !variant.sizes) {
            return 0;
        }

        const sizeStock = variant.sizes.find(s => s.size === size);
        return sizeStock ? sizeStock.stock : 0;
    }

    getAvailableColorsText(product: ProductEmbroided): string {
        const colors = this.getAvailableColors(product);
        return colors.length > 0 ? colors.map(c => c.label).join(', ') : 'No disponible';
    }

    getAllAvailableSizesText(product: ProductEmbroided): string {
        const sizes = this.getAllAvailableSizes(product);
        return sizes.length > 0 ? sizes.map(s => s.label).join(', ') : 'No disponible';
    }

    onColorChange() {
        console.log('Color changed to:', this.productSelectionForm.get('selectedColor')?.value);
        this.productSelectionForm.get('selectedSize')?.setValue(''); // Reset size selection
        // Force change detection
        setTimeout(() => {
            console.log('Available sizes after color change:', this.getAvailableSizes(this.selectedProduct!, this.productSelectionForm.get('selectedColor')?.value));
        }, 0);
    }

} 
