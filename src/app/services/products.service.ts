import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Producto } from '../model/product';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private products: Producto[] = [
        new Producto({
            id: '1',
            nombre: 'Remera Oversize Blanca Bordada',
            descripcion: 'Remera oversize de algodón premium con bordado floral listo',
            precio: 8500,
            imagen: '/prendas/remera_oversize_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'L',
            colorPrenda: 'Blanco',
            stock: 15,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.8,
            descuento: 29,
            esNuevo: true,
            esDestacado: true
        }),
        new Producto({
            id: '2',
            nombre: 'Buzo Capucha Gris Bordado',
            descripcion: 'Buzo con capucha de frisa suave con bordado deportivo',
            precio: 15000,
            imagen: '/prendas/buzo_capucha_gris.webp',
            tipoPrenda: 'buzo',
            talle: 'M',
            colorPrenda: 'Gris',
            stock: 8,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['casual', 'basico', 'bordado'],
            rating: 4.6,
            descuento: 25,
            esNuevo: false,
            esDestacado: true
        }),
        new Producto({
            id: '3',
            nombre: 'Remera Negra Oversize',
            descripcion: 'Remera oversize negra de algodón premium con bordado minimalista',
            precio: 7500,
            imagen: '/prendas/remera_oversize_negra.webp',
            tipoPrenda: 'remera',
            talle: 'XL',
            colorPrenda: 'Negro',
            stock: 12,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'basico', 'bordado', 'negro'],
            rating: 4.7,
            descuento: 15,
            esNuevo: true,
            esDestacado: false
        }),
        new Producto({
            id: '4',
            nombre: 'Buzo Frisa Negro Bordado',
            descripcion: 'Buzo de frisa negra con bordado deportivo en el frente',
            precio: 12000,
            imagen: '/prendas/buzo_frisa_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'S',
            colorPrenda: 'Negro',
            stock: 6,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['casual', 'deportivo', 'bordado'],
            rating: 4.5,
            descuento: 20,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '5',
            nombre: 'Remera Blanca Básica',
            descripcion: 'Remera blanca básica de algodón con bordado floral',
            precio: 6500,
            imagen: '/prendas/remera_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'M',
            colorPrenda: 'Blanco',
            stock: 20,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['basico', 'bordado', 'floral'],
            rating: 4.4,
            descuento: 0,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '6',
            nombre: 'Buzo Oversize Gris',
            descripcion: 'Buzo oversize gris con bordado personalizado',
            precio: 13500,
            imagen: '/prendas/buzo_oversize_gris.webp',
            tipoPrenda: 'buzo',
            talle: 'L',
            colorPrenda: 'Gris',
            stock: 10,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.9,
            descuento: 30,
            esNuevo: true,
            esDestacado: true
        }),
        new Producto({
            id: '7',
            nombre: 'Remera Negra Básica',
            descripcion: 'Remera negra básica de algodón con bordado geométrico',
            precio: 7000,
            imagen: '/prendas/remera_negra.webp',
            tipoPrenda: 'remera',
            talle: 'S',
            colorPrenda: 'Negro',
            stock: 18,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['basico', 'bordado', 'negro', 'geometrico'],
            rating: 4.3,
            descuento: 10,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '8',
            nombre: 'Buzo Capucha Negro',
            descripcion: 'Buzo con capucha negra de frisa premium con bordado urbano',
            precio: 16000,
            imagen: '/prendas/buzo_capucha_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'XL',
            colorPrenda: 'Negro',
            stock: 7,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['casual', 'urbano', 'bordado', 'negro'],
            rating: 4.7,
            descuento: 35,
            esNuevo: true,
            esDestacado: true
        }),
        new Producto({
            id: '9',
            nombre: 'Remera Oversize Azul',
            descripcion: 'Remera oversize azul con bordado náutico',
            precio: 8000,
            imagen: '/prendas/remera_oversize_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'L',
            colorPrenda: 'Azul',
            stock: 14,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'nautico', 'bordado', 'azul'],
            rating: 4.6,
            descuento: 0,
            esNuevo: true,
            esDestacado: false
        }),
        new Producto({
            id: '10',
            nombre: 'Buzo Oversize Negro',
            descripcion: 'Buzo oversize negro con bordado minimalista',
            precio: 14000,
            imagen: '/prendas/buzo_oversize_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'M',
            colorPrenda: 'Negro',
            stock: 9,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['oversize', 'minimalista', 'bordado', 'negro'],
            rating: 4.8,
            descuento: 25,
            esNuevo: false,
            esDestacado: true
        }),
        new Producto({
            id: '11',
            nombre: 'Remera Blanca Oversize',
            descripcion: 'Remera blanca oversize con bordado vintage',
            precio: 7800,
            imagen: '/prendas/remera_oversize_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'XL',
            colorPrenda: 'Blanco',
            stock: 16,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'vintage', 'bordado', 'blanco'],
            rating: 4.5,
            descuento: 15,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '12',
            nombre: 'Buzo Frisa Gris',
            descripcion: 'Buzo de frisa gris con bordado deportivo',
            precio: 12500,
            imagen: '/prendas/buzo_frisa_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'S',
            colorPrenda: 'Gris',
            stock: 11,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['deportivo', 'bordado', 'gris'],
            rating: 4.4,
            descuento: 0,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '13',
            nombre: 'Remera Negra Oversize Premium',
            descripcion: 'Remera negra oversize premium con bordado artístico',
            precio: 9500,
            imagen: '/prendas/remera_oversize_negra.webp',
            tipoPrenda: 'remera',
            talle: 'L',
            colorPrenda: 'Negro',
            stock: 8,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'premium', 'bordado', 'artistico'],
            rating: 4.9,
            descuento: 40,
            esNuevo: true,
            esDestacado: true
        }),
        new Producto({
            id: '14',
            nombre: 'Buzo Capucha Oversize',
            descripcion: 'Buzo con capucha oversize con bordado urbano',
            precio: 17000,
            imagen: '/prendas/buzo_capucha_gris.webp',
            tipoPrenda: 'buzo',
            talle: 'XL',
            colorPrenda: 'Gris',
            stock: 6,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['oversize', 'urbano', 'bordado'],
            rating: 4.7,
            descuento: 30,
            esNuevo: true,
            esDestacado: false
        }),
        new Producto({
            id: '15',
            nombre: 'Remera Blanca Básica Premium',
            descripcion: 'Remera blanca básica premium con bordado elegante',
            precio: 7200,
            imagen: '/prendas/remera_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'M',
            colorPrenda: 'Blanco',
            stock: 22,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['basico', 'premium', 'bordado', 'elegante'],
            rating: 4.6,
            descuento: 5,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '16',
            nombre: 'Buzo Frisa Oversize Premium',
            descripcion: 'Buzo de frisa oversize premium con bordado exclusivo',
            precio: 18000,
            imagen: '/prendas/buzo_oversize_gris.webp',
            tipoPrenda: 'buzo',
            talle: 'L',
            colorPrenda: 'Gris',
            stock: 4,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['oversize', 'premium', 'bordado', 'exclusivo'],
            rating: 5.0,
            descuento: 50,
            esNuevo: true,
            esDestacado: true
        }),
        new Producto({
            id: '17',
            nombre: 'Remera Negra Básica Oversize',
            descripcion: 'Remera negra básica oversize con bordado moderno',
            precio: 8200,
            imagen: '/prendas/remera_oversize_negra.webp',
            tipoPrenda: 'remera',
            talle: 'XL',
            colorPrenda: 'Negro',
            stock: 13,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['basico', 'oversize', 'bordado', 'moderno'],
            rating: 4.5,
            descuento: 20,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '18',
            nombre: 'Buzo Capucha Frisa',
            descripcion: 'Buzo con capucha de frisa con bordado clásico',
            precio: 14500,
            imagen: '/prendas/buzo_capucha_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'M',
            colorPrenda: 'Negro',
            stock: 9,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['clasico', 'bordado', 'frisa'],
            rating: 4.4,
            descuento: 0,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '19',
            nombre: 'Remera Blanca Oversize Básica',
            descripcion: 'Remera blanca oversize básica con bordado simple',
            precio: 6800,
            imagen: '/prendas/remera_oversize_blanca.webp',
            tipoPrenda: 'remera',
            talle: 'L',
            colorPrenda: 'Blanco',
            stock: 25,
            tipo: 'bordado',
            categoria: 'remeras',
            tags: ['oversize', 'basico', 'bordado', 'simple'],
            rating: 4.3,
            descuento: 10,
            esNuevo: false,
            esDestacado: false
        }),
        new Producto({
            id: '20',
            nombre: 'Buzo Oversize Frisa Premium',
            descripcion: 'Buzo oversize de frisa premium con bordado artístico',
            precio: 19000,
            imagen: '/prendas/buzo_oversize_negro.webp',
            tipoPrenda: 'buzo',
            talle: 'XL',
            colorPrenda: 'Negro',
            stock: 3,
            tipo: 'bordado',
            categoria: 'buzos',
            tags: ['oversize', 'premium', 'bordado', 'artistico'],
            rating: 4.9,
            descuento: 45,
            esNuevo: true,
            esDestacado: true
        })
    ];

    constructor() { }

    /**
     * Get all products
     */
    getProducts(): Observable<Producto[]> {
        return of([...this.products]).pipe(delay(500)); // Simulate API delay
    }

    /**
     * Get product by ID
     */
    getProductById(id: string): Observable<Producto | undefined> {
        const product = this.products.find(p => p.id === id);
        return of(product).pipe(delay(300));
    }

    /**
     * Create a new product
     */
    createProduct(product: Producto): Observable<Producto> {
        // Generate a new ID if not provided
        if (!product.id) {
            product.id = this.generateId();
        }

        // Check if ID already exists
        if (this.products.find(p => p.id === product.id)) {
            throw new Error('Product with this ID already exists');
        }

        this.products.push(product);
        return of(product).pipe(delay(400));
    }

    /**
     * Update an existing product
     */
    updateProduct(product: Producto): Observable<Producto> {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index === -1) {
            throw new Error('Product not found');
        }

        this.products[index] = product;
        return of(product).pipe(delay(400));
    }

    /**
     * Delete a product
     */
    deleteProduct(id: string): Observable<boolean> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Product not found');
        }

        this.products.splice(index, 1);
        return of(true).pipe(delay(300));
    }

    /**
     * Search products by name, description, or category
     */
    searchProducts(query: string): Observable<Producto[]> {
        if (!query.trim()) {
            return this.getProducts();
        }

        const filteredProducts = this.products.filter(product =>
            product.nombre.toLowerCase().includes(query.toLowerCase()) ||
            product.descripcion.toLowerCase().includes(query.toLowerCase()) ||
            product.categoria.toLowerCase().includes(query.toLowerCase())
        );

        return of(filteredProducts).pipe(delay(200));
    }

    /**
     * Get products by category
     */
    getProductsByCategory(category: string): Observable<Producto[]> {
        const filteredProducts = this.products.filter(product =>
            product.categoria === category
        );
        return of(filteredProducts).pipe(delay(300));
    }

    /**
     * Get featured products
     */
    getFeaturedProducts(): Observable<Producto[]> {
        const featuredProducts = this.products.filter(product =>
            product.esDestacado
        );
        return of(featuredProducts).pipe(delay(300));
    }

    /**
     * Get new products
     */
    getNewProducts(): Observable<Producto[]> {
        const newProducts = this.products.filter(product =>
            product.esNuevo
        );
        return of(newProducts).pipe(delay(300));
    }

    /**
     * Get products on sale (with discount)
     */
    getProductsOnSale(): Observable<Producto[]> {
        const saleProducts = this.products.filter(product =>
            product.descuento > 0
        );
        return of(saleProducts).pipe(delay(300));
    }

    /**
     * Get products with low stock (5 or less)
     */
    getLowStockProducts(): Observable<Producto[]> {
        const lowStockProducts = this.products.filter(product =>
            product.stock <= 5
        );
        return of(lowStockProducts).pipe(delay(300));
    }

    /**
     * Generate a unique ID for new products
     */
    private generateId(): string {
        const maxId = Math.max(...this.products.map(p => parseInt(p.id)), 0);
        return (maxId + 1).toString();
    }

    /**
     * Check if a product ID already exists
     */
    productExists(id: string): boolean {
        return this.products.some(p => p.id === id);
    }

    /**
     * Get total number of products
     */
    getTotalProducts(): Observable<number> {
        return of(this.products.length).pipe(delay(100));
    }

    /**
     * Get products count by category
     */
    getProductsCountByCategory(): Observable<{ [key: string]: number }> {
        const count: { [key: string]: number } = {};
        this.products.forEach(product => {
            count[product.categoria] = (count[product.categoria] || 0) + 1;
        });
        return of(count).pipe(delay(200));
    }

} 