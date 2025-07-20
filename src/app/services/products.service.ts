import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../model/product';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private products: Product[] = [
        new Product({
            id: '1',
            name: 'Remera Oversize Blanca Bordada',
            description: 'Remera oversize de algodón premium con bordado floral listo',
            price: 8500,
            image: '/prendas/remera_oversize_blanca.webp',
            garmentType: 'remera',
            size: 'L',
            garmentColor: 'Blanco',
            stock: 15,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.8,
            discount: 29,
            isNew: true,
            isFeatured: true
        }),
        new Product({
            id: '2',
            name: 'Buzo Capucha Gris Bordado',
            description: 'Buzo con capucha de frisa suave con bordado deportivo',
            price: 15000,
            image: '/prendas/buzo_capucha_gris.webp',
            garmentType: 'buzo',
            size: 'M',
            garmentColor: 'Gris',
            stock: 8,
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'deportivo', 'bordado'],
            rating: 4.6,
            discount: 25,
            isNew: false,
            isFeatured: true
        }),
        new Product({
            id: '3',
            name: 'Remera Negra Oversize',
            description: 'Remera oversize negra de algodón premium con bordado minimalista',
            price: 7500,
            image: '/prendas/remera_oversize_negra.webp',
            garmentType: 'remera',
            size: 'XL',
            garmentColor: 'Negro',
            stock: 12,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.7,
            discount: 15,
            isNew: true,
            isFeatured: false
        }),
        new Product({
            id: '4',
            name: 'Buzo Frisa Negro Bordado',
            description: 'Buzo de frisa negra con bordado deportivo en el frente',
            price: 12000,
            image: '/prendas/buzo_frisa_negro.webp',
            garmentType: 'buzo',
            size: 'S',
            garmentColor: 'Negro',
            stock: 6,
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'deportivo', 'bordado'],
            rating: 4.5,
            discount: 20,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '5',
            name: 'Remera Blanca Básica',
            description: 'Remera blanca básica de algodón con bordado floral',
            price: 6500,
            image: '/prendas/remera_blanca.webp',
            garmentType: 'remera',
            size: 'M',
            garmentColor: 'Blanco',
            stock: 20,
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'bordado'],
            rating: 4.4,
            discount: 0,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '6',
            name: 'Buzo Oversize Gris',
            description: 'Buzo oversize gris con bordado personalizado',
            price: 13500,
            image: '/prendas/buzo_oversize_gris.webp',
            garmentType: 'buzo',
            size: 'L',
            garmentColor: 'Gris',
            stock: 10,
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.9,
            discount: 30,
            isNew: true,
            isFeatured: true
        }),
        new Product({
            id: '7',
            name: 'Remera Negra Básica',
            description: 'Remera negra básica de algodón con bordado geométrico',
            price: 7000,
            image: '/prendas/remera_negra.webp',
            garmentType: 'remera',
            size: 'S',
            garmentColor: 'Negro',
            stock: 18,
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'bordado'],
            rating: 4.3,
            discount: 10,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '8',
            name: 'Buzo Capucha Negro',
            description: 'Buzo con capucha negra de frisa premium con bordado urbano',
            price: 16000,
            image: '/prendas/buzo_capucha_negro.webp',
            garmentType: 'buzo',
            size: 'XL',
            garmentColor: 'Negro',
            stock: 7,
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'premium', 'bordado'],
            rating: 4.7,
            discount: 35,
            isNew: true,
            isFeatured: true
        }),
        new Product({
            id: '9',
            name: 'Remera Oversize Azul',
            description: 'Remera oversize azul con bordado náutico',
            price: 8000,
            image: '/prendas/remera_oversize_blanca.webp',
            garmentType: 'remera',
            size: 'L',
            garmentColor: 'Azul',
            stock: 14,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'bordado'],
            rating: 4.6,
            discount: 0,
            isNew: true,
            isFeatured: false
        }),
        new Product({
            id: '10',
            name: 'Buzo Oversize Negro',
            description: 'Buzo oversize negro con bordado minimalista',
            price: 14000,
            image: '/prendas/buzo_oversize_negro.webp',
            garmentType: 'buzo',
            size: 'M',
            garmentColor: 'Negro',
            stock: 9,
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.8,
            discount: 25,
            isNew: false,
            isFeatured: true
        }),
        new Product({
            id: '11',
            name: 'Remera Blanca Oversize',
            description: 'Remera blanca oversize con bordado vintage',
            price: 7800,
            image: '/prendas/remera_oversize_blanca.webp',
            garmentType: 'remera',
            size: 'XL',
            garmentColor: 'Blanco',
            stock: 16,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.5,
            discount: 0,
            isNew: true,
            isFeatured: false
        }),
        new Product({
            id: '12',
            name: 'Buzo Frisa Gris',
            description: 'Buzo de frisa gris con bordado clásico',
            price: 11000,
            image: '/prendas/buzo_frisa_negro.webp',
            garmentType: 'buzo',
            size: 'L',
            garmentColor: 'Gris',
            stock: 11,
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'bordado'],
            rating: 4.4,
            discount: 15,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '13',
            name: 'Remera Negra Oversize Premium',
            description: 'Remera negra oversize premium con bordado artístico',
            price: 9500,
            image: '/prendas/remera_oversize_negra.webp',
            garmentType: 'remera',
            size: 'L',
            garmentColor: 'Negro',
            stock: 8,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 4.9,
            discount: 40,
            isNew: true,
            isFeatured: true
        }),
        new Product({
            id: '14',
            name: 'Buzo Capucha Oversize',
            description: 'Buzo con capucha oversize con bordado urbano',
            price: 17000,
            image: '/prendas/buzo_capucha_gris.webp',
            garmentType: 'buzo',
            size: 'XL',
            garmentColor: 'Gris',
            stock: 6,
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.7,
            discount: 30,
            isNew: true,
            isFeatured: false
        }),
        new Product({
            id: '15',
            name: 'Remera Blanca Básica Premium',
            description: 'Remera blanca básica premium con bordado elegante',
            price: 7200,
            image: '/prendas/remera_blanca.webp',
            garmentType: 'remera',
            size: 'M',
            garmentColor: 'Blanco',
            stock: 22,
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'premium', 'bordado'],
            rating: 4.6,
            discount: 5,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '16',
            name: 'Buzo Frisa Oversize Premium',
            description: 'Buzo de frisa oversize premium con bordado exclusivo',
            price: 18000,
            image: '/prendas/buzo_oversize_gris.webp',
            garmentType: 'buzo',
            size: 'L',
            garmentColor: 'Gris',
            stock: 4,
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 5.0,
            discount: 50,
            isNew: true,
            isFeatured: true
        }),
        new Product({
            id: '17',
            name: 'Remera Negra Básica Oversize',
            description: 'Remera negra básica oversize con bordado moderno',
            price: 8200,
            image: '/prendas/remera_oversize_negra.webp',
            garmentType: 'remera',
            size: 'XL',
            garmentColor: 'Negro',
            stock: 13,
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'oversize', 'bordado'],
            rating: 4.5,
            discount: 20,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '18',
            name: 'Buzo Capucha Frisa',
            description: 'Buzo con capucha de frisa con bordado clásico',
            price: 14500,
            image: '/prendas/buzo_capucha_negro.webp',
            garmentType: 'buzo',
            size: 'M',
            garmentColor: 'Negro',
            stock: 9,
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'bordado'],
            rating: 4.4,
            discount: 0,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '19',
            name: 'Remera Blanca Oversize Básica',
            description: 'Remera blanca oversize básica con bordado simple',
            price: 6800,
            image: '/prendas/remera_oversize_blanca.webp',
            garmentType: 'remera',
            size: 'L',
            garmentColor: 'Blanco',
            stock: 25,
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.3,
            discount: 10,
            isNew: false,
            isFeatured: false
        }),
        new Product({
            id: '20',
            name: 'Buzo Oversize Frisa Premium',
            description: 'Buzo oversize de frisa premium con bordado artístico',
            price: 19000,
            image: '/prendas/buzo_oversize_negro.webp',
            garmentType: 'buzo',
            size: 'XL',
            garmentColor: 'Negro',
            stock: 3,
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 4.9,
            discount: 45,
            isNew: true,
            isFeatured: true
        })
    ];

    constructor() { }

    /**
     * Get all products
     */
    getProducts(): Observable<Product[]> {
        return of(this.products).pipe(delay(500)); // Simulate API delay
    }

    /**
     * Get product by ID
     */
    getProductById(id: string): Observable<Product | undefined> {
        const product = this.products.find(p => p.id === id);
        return of(product).pipe(delay(300));
    }

    /**
     * Create a new product
     */
    createProduct(product: Product): Observable<Product> {
        const newProduct = new Product({
            ...product,
            id: this.generateId()
        });
        this.products.push(newProduct);
        return of(newProduct).pipe(delay(500));
    }

    /**
     * Update an existing product
     */
    updateProduct(product: Product): Observable<Product> {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = new Product(product);
            return of(this.products[index]).pipe(delay(500));
        }
        throw new Error('Producto no encontrado');
    }

    /**
     * Delete a product
     */
    deleteProduct(id: string): Observable<boolean> {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            return of(true).pipe(delay(300));
        }
        return of(false).pipe(delay(300));
    }

    /**
     * Search products by name, description, or category
     */
    searchProducts(query: string): Observable<Product[]> {
        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        return of(filtered).pipe(delay(300));
    }

    /**
     * Get products by category
     */
    getProductsByCategory(category: string): Observable<Product[]> {
        const filtered = this.products.filter(product => product.category === category);
        return of(filtered).pipe(delay(300));
    }

    /**
     * Get featured products
     */
    getFeaturedProducts(): Observable<Product[]> {
        const featured = this.products.filter(product => product.isFeatured);
        return of(featured).pipe(delay(300));
    }

    /**
     * Get new products
     */
    getNewProducts(): Observable<Product[]> {
        const newProducts = this.products.filter(product => product.isNew);
        return of(newProducts).pipe(delay(300));
    }

    /**
     * Get products on sale (with discount)
     */
    getProductsOnSale(): Observable<Product[]> {
        const onSale = this.products.filter(product => product.discount > 0);
        return of(onSale).pipe(delay(300));
    }

    /**
     * Get products with low stock (5 or less)
     */
    getLowStockProducts(): Observable<Product[]> {
        const lowStock = this.products.filter(product => product.stock < 10);
        return of(lowStock).pipe(delay(300));
    }

    /**
     * Generate a unique ID for new products
     */
    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Check if a product ID already exists
     */
    productExists(id: string): boolean {
        return this.products.some(product => product.id === id);
    }

    /**
     * Get total number of products
     */
    getTotalProducts(): Observable<number> {
        return of(this.products.length).pipe(delay(200));
    }

    /**
     * Get products count by category
     */
    getProductsCountByCategory(): Observable<{ [key: string]: number }> {
        const countByCategory: { [key: string]: number } = {};
        this.products.forEach(product => {
            countByCategory[product.category] = (countByCategory[product.category] || 0) + 1;
        });
        return of(countByCategory).pipe(delay(300));
    }

} 
