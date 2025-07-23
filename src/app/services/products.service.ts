import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../models/product';
import { ProductCustomizable } from '../models/product-customizable';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private products: Product[] = [
        new Product({
            id: '1',
            name: 'Remera Oversize Bordada',
            description: 'Remera oversize de algodón premium con bordado floral listo',
            price: 8500,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.8,
            discount: 29,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 5 },
                        { size: 'M', stock: 8 },
                        { size: 'L', stock: 6 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/remera_oversize_negra.webp',
                    sizes: [
                        { size: 'M', stock: 7 },
                        { size: 'L', stock: 4 },
                        { size: 'XL', stock: 3 }
                    ]
                },
                {
                    color: 'Azul',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 0 }
                    ]
                }
            ]
        }),
        new Product({
            id: '2',
            name: 'Buzo Capucha Bordado',
            description: 'Buzo con capucha de frisa suave con bordado deportivo',
            price: 15000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'deportivo', 'bordado'],
            rating: 4.6,
            discount: 25,
            isNew: false,
            isFeatured: true,
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_capucha_gris.webp',
                    sizes: [
                        { size: 'M', stock: 4 },
                        { size: 'L', stock: 6 },
                        { size: 'XL', stock: 2 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/buzo_capucha_negro.webp',
                    sizes: [
                        { size: 'S', stock: 3 },
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 4 }
                    ]
                },
                {
                    color: 'Rojo',
                    image: '/prendas/buzo_capucha_gris.webp',
                    sizes: [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 0 },
                        { size: 'XL', stock: 0 }
                    ]
                }
            ]
        }),
        new Product({
            id: '3',
            name: 'Remera Oversize Bordada',
            description: 'Remera oversize de algodón premium con bordado minimalista',
            price: 7500,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.7,
            discount: 15,
            isNew: true,
            isFeatured: false,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/remera_oversize_negra.webp',
                    sizes: [
                        { size: 'M', stock: 6 },
                        { size: 'L', stock: 8 },
                        { size: 'XL', stock: 4 }
                    ]
                },
                {
                    color: 'Blanco',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 5 },
                        { size: 'M', stock: 7 },
                        { size: 'L', stock: 5 }
                    ]
                },
                {
                    color: 'Verde',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 2 },
                        { size: 'L', stock: 0 },
                        { size: 'XL', stock: 1 }
                    ]
                }
            ]
        }),
        new Product({
            id: '4',
            name: 'Buzo Frisa Bordado',
            description: 'Buzo de frisa con bordado deportivo en el frente',
            price: 12000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'deportivo', 'bordado'],
            rating: 4.5,
            discount: 20,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/buzo_frisa_negro.webp',
                    sizes: [
                        { size: 'S', stock: 3 },
                        { size: 'M', stock: 5 },
                        { size: 'L', stock: 4 }
                    ]
                },
                {
                    color: 'Gris',
                    image: '/prendas/buzo_frisa_negro.webp',
                    sizes: [
                        { size: 'M', stock: 4 },
                        { size: 'L', stock: 6 },
                        { size: 'XL', stock: 2 }
                    ]
                }
            ]
        }),
        new Product({
            id: '5',
            name: 'Remera Básica Bordada',
            description: 'Remera básica de algodón con bordado floral',
            price: 6500,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'bordado'],
            rating: 4.4,
            discount: 0,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_blanca.webp',
                    sizes: [
                        { size: 'M', stock: 10 },
                        { size: 'L', stock: 12 },
                        { size: 'XL', stock: 8 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/remera_negra.webp',
                    sizes: [
                        { size: 'S', stock: 6 },
                        { size: 'M', stock: 8 },
                        { size: 'L', stock: 10 }
                    ]
                }
            ]
        }),
        new Product({
            id: '6',
            name: 'Buzo Oversize',
            description: 'Buzo oversize con bordado personalizado',
            price: 13500,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.9,
            discount: 30,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_oversize_gris.webp',
                    sizes: [
                        { size: 'L', stock: 10 }
                    ]
                }
            ]
        }),
        new Product({
            id: '7',
            name: 'Remera Básica',
            description: 'Remera básica de algodón con bordado geométrico',
            price: 7000,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'bordado'],
            rating: 4.3,
            discount: 10,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/remera_negra.webp',
                    sizes: [
                        { size: 'S', stock: 9 },
                        { size: 'M', stock: 9 }
                    ]
                }
            ]
        }),
        new Product({
            id: '8',
            name: 'Buzo Capucha',
            description: 'Buzo con capucha de frisa premium con bordado urbano',
            price: 16000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'premium', 'bordado'],
            rating: 4.7,
            discount: 35,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/buzo_capucha_negro.webp',
                    sizes: [
                        { size: 'XL', stock: 7 }
                    ]
                }
            ]
        }),
        new Product({
            id: '9',
            name: 'Remera Oversize',
            description: 'Remera oversize con bordado náutico',
            price: 8000,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'bordado'],
            rating: 4.6,
            discount: 0,
            isNew: true,
            isFeatured: false,
            variants: [
                {
                    color: 'Azul',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'L', stock: 14 }
                    ]
                }
            ]
        }),
        new Product({
            id: '10',
            name: 'Buzo Oversize',
            description: 'Buzo oversize con bordado minimalista',
            price: 14000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.8,
            discount: 25,
            isNew: false,
            isFeatured: true,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/buzo_oversize_negro.webp',
                    sizes: [
                        { size: 'M', stock: 9 }
                    ]
                }
            ]
        }),
        new Product({
            id: '11',
            name: 'Remera Oversize',
            description: 'Remera oversize con bordado vintage',
            price: 7800,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.5,
            discount: 0,
            isNew: true,
            isFeatured: false,
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'XL', stock: 16 }
                    ]
                }
            ]
        }),
        new Product({
            id: '12',
            name: 'Buzo Frisa',
            description: 'Buzo de frisa con bordado clásico',
            price: 11000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'bordado'],
            rating: 4.4,
            discount: 15,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_frisa_negro.webp',
                    sizes: [
                        { size: 'L', stock: 11 }
                    ]
                }
            ]
        }),
        new Product({
            id: '13',
            name: 'Remera Oversize Premium',
            description: 'Remera oversize premium con bordado artístico',
            price: 9500,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 4.9,
            discount: 40,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/remera_oversize_negra.webp',
                    sizes: [
                        { size: 'L', stock: 8 }
                    ]
                }
            ]
        }),
        new Product({
            id: '14',
            name: 'Buzo Capucha Oversize',
            description: 'Buzo con capucha oversize con bordado urbano',
            price: 17000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'casual', 'bordado'],
            rating: 4.7,
            discount: 30,
            isNew: true,
            isFeatured: false,
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_capucha_gris.webp',
                    sizes: [
                        { size: 'XL', stock: 6 }
                    ]
                }
            ]
        }),
        new Product({
            id: '15',
            name: 'Remera Básica Premium',
            description: 'Remera básica premium con bordado elegante',
            price: 7200,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'premium', 'bordado'],
            rating: 4.6,
            discount: 5,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_blanca.webp',
                    sizes: [
                        { size: 'M', stock: 11 },
                        { size: 'L', stock: 11 }
                    ]
                }
            ]
        }),
        new Product({
            id: '16',
            name: 'Buzo Frisa Oversize Premium',
            description: 'Buzo de frisa oversize premium con bordado exclusivo',
            price: 18000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 5.0,
            discount: 50,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_oversize_gris.webp',
                    sizes: [
                        { size: 'L', stock: 4 }
                    ]
                }
            ]
        }),
        new Product({
            id: '17',
            name: 'Remera Básica Oversize',
            description: 'Remera básica oversize con bordado moderno',
            price: 8200,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['basico', 'oversize', 'bordado'],
            rating: 4.5,
            discount: 20,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/remera_oversize_negra.webp',
                    sizes: [
                        { size: 'XL', stock: 13 }
                    ]
                }
            ]
        }),
        new Product({
            id: '18',
            name: 'Buzo Capucha Frisa',
            description: 'Buzo con capucha de frisa con bordado clásico',
            price: 14500,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['casual', 'bordado'],
            rating: 4.4,
            discount: 0,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/buzo_capucha_negro.webp',
                    sizes: [
                        { size: 'M', stock: 9 }
                    ]
                }
            ]
        }),
        new Product({
            id: '19',
            name: 'Remera Oversize Básica',
            description: 'Remera oversize básica con bordado simple',
            price: 6800,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['oversize', 'basico', 'bordado'],
            rating: 4.3,
            discount: 10,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'L', stock: 25 }
                    ]
                }
            ]
        }),
        new Product({
            id: '20',
            name: 'Buzo Oversize Frisa Premium',
            description: 'Buzo oversize de frisa premium con bordado artístico',
            price: 19000,
            garmentType: 'buzo',
            type: 'bordado',
            category: 'buzos',
            tags: ['oversize', 'premium', 'bordado'],
            rating: 4.9,
            discount: 45,
            isNew: true,
            isFeatured: true,
            variants: [
                {
                    color: 'Negro',
                    image: '/prendas/buzo_oversize_negro.webp',
                    sizes: [
                        { size: 'XL', stock: 3 }
                    ]
                }
            ]
        }),
        new Product({
            id: '21',
            name: 'Remera Test Sin Stock',
            description: 'Remera de prueba para testear productos sin stock',
            price: 5000,
            garmentType: 'remera',
            type: 'bordado',
            category: 'remeras',
            tags: ['test', 'bordado'],
            rating: 4.0,
            discount: 0,
            isNew: false,
            isFeatured: false,
            variants: [
                {
                    color: 'Amarillo',
                    image: '/prendas/remera_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 0 }
                    ]
                },
                {
                    color: 'Naranja',
                    image: '/prendas/remera_negra.webp',
                    sizes: [
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 0 },
                        { size: 'XL', stock: 0 }
                    ]
                }
            ]
        })
    ];

    private customizableProducts: ProductCustomizable[] = [
        new ProductCustomizable({
            id: '1',
            name: 'Remera Personalizable',
            description: 'Remera de algodón premium lista para personalizar.',
            garmentType: 'remera',
            price: 12000,
            type: 'personalizable',
            variants: [
                {
                    color: 'Blanco',
                    image: '/prendas/remera_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 12 },
                        { size: 'L', stock: 7 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/remera_negra.webp',
                    sizes: [
                        { size: 'S', stock: 5 },
                        { size: 'M', stock: 10 },
                        { size: 'L', stock: 6 }
                    ]
                }
            ]
        }),
        new ProductCustomizable({
            id: '2',
            name: 'Buzo Personalizable',
            description: 'Buzo de frisa premium para personalizar con tu diseño.',
            garmentType: 'buzo',
            price: 18000,
            type: 'personalizable',
            variants: [
                {
                    color: 'Gris',
                    image: '/prendas/buzo_oversize_gris.webp',
                    sizes: [
                        { size: 'M', stock: 6 },
                        { size: 'L', stock: 4 },
                        { size: 'XL', stock: 2 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/buzo_oversize_negro.webp',
                    sizes: [
                        { size: 'M', stock: 5 },
                        { size: 'L', stock: 3 },
                        { size: 'XL', stock: 1 }
                    ]
                }
            ]
        }),
        new ProductCustomizable({
            id: '3',
            name: 'Remera Oversize Personalizable',
            description: 'Remera oversize lista para tu bordado personalizado.',
            garmentType: 'remera',
            price: 13500,
            type: 'personalizable',
            variants: [
                {
                    color: 'Azul',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'M', stock: 7 },
                        { size: 'L', stock: 5 }
                    ]
                },
                {
                    color: 'Blanco',
                    image: '/prendas/remera_oversize_blanca.webp',
                    sizes: [
                        { size: 'S', stock: 4 },
                        { size: 'M', stock: 8 }
                    ]
                }
            ]
        }),
        new ProductCustomizable({
            id: '4',
            name: 'Campera Personalizable',
            description: 'Campera de algodón lista para personalizar con tus colores favoritos.',
            garmentType: 'campera',
            price: 22000,
            type: 'personalizable',
            variants: [
                {
                    color: 'Verde',
                    image: '/prendas/buzo_frisa_negro.webp',
                    sizes: [
                        { size: 'M', stock: 3 },
                        { size: 'L', stock: 2 }
                    ]
                },
                {
                    color: 'Negro',
                    image: '/prendas/buzo_frisa_negro.webp',
                    sizes: [
                        { size: 'S', stock: 2 },
                        { size: 'M', stock: 1 }
                    ]
                }
            ]
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
        const lowStock = this.products.filter(product =>
            product.variants?.some(variant =>
                variant.sizes?.some(sizeStock => sizeStock.stock < 10)
            )
        );
        return of(lowStock).pipe(delay(300));
    }

    /**
     * Generate a unique ID for new products
     */
    private generateId(): string {
        const maxId = this.products
            .map(p => Number(p.id))
            .filter(id => !isNaN(id))
            .reduce((max, id) => Math.max(max, id), 0);
        return (maxId + 1).toString();
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

    getCustomizableProducts(): Observable<ProductCustomizable[]> {
        return of(this.customizableProducts).pipe(delay(500));
    }

    /**
     * Create a new customizable product
     */
    createCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        const newProduct = new ProductCustomizable({
            ...product,
            id: this.generateCustomizableId()
        });
        this.customizableProducts.push(newProduct);
        return of(newProduct).pipe(delay(500));
    }

    /**
     * Update an existing customizable product
     */
    updateCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        const index = this.customizableProducts.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.customizableProducts[index] = new ProductCustomizable(product);
            return of(this.customizableProducts[index]).pipe(delay(500));
        }
        throw new Error('Producto personalizable no encontrado');
    }

    /**
     * Delete a customizable product
     */
    deleteCustomizableProduct(id: string): Observable<boolean> {
        const index = this.customizableProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.customizableProducts.splice(index, 1);
            return of(true).pipe(delay(300));
        }
        return of(false).pipe(delay(300));
    }

    /**
     * Generate a unique ID for new customizable products
     */
    private generateCustomizableId(): string {
        const maxId = this.customizableProducts
            .map(p => {
                const numId = p.id.replace(/\D/g, '');
                return numId ? Number(numId) : 0;
            })
            .reduce((max, id) => Math.max(max, id), 0);
        return `CUST-${(maxId + 1).toString().padStart(3, '0')}`;
    }

} 
