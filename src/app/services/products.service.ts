import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';
import { ProductCustomizable } from '../models/product-customizable';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products`);
    }

    getProductById(id: string): Observable<Product | undefined> {
        return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
    }

    createProduct(product: Product): Observable<Product> {
        const newProduct = {
            ...product,
            id: this.generateId()
        };
        return this.http.post<Product>(`${this.apiUrl}/products`, newProduct);
    }

    updateProduct(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/products/${product.id}`, product);
    }

    deleteProduct(id: string): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    searchProducts(query: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products?q=${query}`);
    }

    getProductsByCategory(category: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products?category=${category}`);
    }

    getFeaturedProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products?isFeatured=true`);
    }

    getNewProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products?isNew=true`);
    }

    getProductsOnSale(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products?discount_gt=0`);
    }

    getLowStockProducts(): Observable<Product[]> {
        // Note: This is a simplified version. In a real API, you might need a custom endpoint
        return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
            map(products => products.filter(product => 
                product.variants.some(variant => 
                    variant.sizes.some(size => size.stock <= 5)
                )
            ))
        );
    }

    private generateId(): string {
        return Date.now().toString();
    }

    productExists(id: string): boolean {
        // This would need to be implemented differently with HTTP
        // For now, we'll assume it doesn't exist
        return false;
    }

    getTotalProducts(): Observable<number> {
        return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
            map(products => products.length)
        );
    }

    getProductsCountByCategory(): Observable<{ [key: string]: number }> {
        return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
            map(products => {
                const counts: { [key: string]: number } = {};
                products.forEach(product => {
                    counts[product.category] = (counts[product.category] || 0) + 1;
                });
                return counts;
            })
        );
    }

    getCustomizableProducts(): Observable<ProductCustomizable[]> {
        return this.http.get<ProductCustomizable[]>(`${this.apiUrl}/customizableProducts`);
    }

    createCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        const newProduct = {
            ...product,
            id: this.generateCustomizableId()
        };
        return this.http.post<ProductCustomizable>(`${this.apiUrl}/customizableProducts`, newProduct);
    }

    updateCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        return this.http.put<ProductCustomizable>(`${this.apiUrl}/customizableProducts/${product.id}`, product);
    }

    deleteCustomizableProduct(id: string): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/customizableProducts/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    private generateCustomizableId(): string {
        return `CUST-${Date.now().toString().slice(-6)}`;
    }
} 
