import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProductEmbroided } from '../models/product-embroided';
import { ProductCustomizable } from '../models/product-customizable';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts`);
    }

    getEmbroidedProductById(id: number): Observable<ProductEmbroided | undefined> {
        return this.http.get<ProductEmbroided>(`${this.apiUrl}/embroidedProducts/${id}`);
    }

    createEmbroidedProduct(product: ProductEmbroided): Observable<ProductEmbroided> {
        const newProduct = {
            ...product
        };
        return this.http.post<ProductEmbroided>(`${this.apiUrl}/embroidedProducts`, newProduct);
    }

    updateEmbroidedProduct(product: ProductEmbroided): Observable<ProductEmbroided> {
        return this.http.put<ProductEmbroided>(`${this.apiUrl}/embroidedProducts/${product.id}`, product);
    }

    deleteEmbroidedProduct(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/embroidedProducts/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    searchEmbroidedProducts(query: string): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts?q=${query}`);
    }

    getEmbroidedProductsByCategory(category: string): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts?garmentType=${category}`);
    }

    getFeaturedEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts?isFeatured=true`);
    }

    getNewEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts?isNew=true`);
    }

    getEmbroidedProductsOnSale(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts?discount_gt=0`);
    }

    getLowStockEmbroidedProducts(): Observable<ProductEmbroided[]> {
        // Note: This is a simplified version. In a real API, you might need a custom endpoint
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts`).pipe(
            map(products => products.filter(product =>
                product.variants.some(variant =>
                    variant.sizes.some(size => size.stock <= 5)
                )
            ))
        );
    }

    productExists(id: number): boolean {
        // This would need to be implemented differently with HTTP
        // For now, we'll assume it doesn't exist
        return false;
    }

    getTotalEmbroidedProducts(): Observable<number> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts`).pipe(
            map(products => products.length)
        );
    }

    getEmbroidedProductsCountByCategory(): Observable<{ [key: string]: number }> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}/embroidedProducts`).pipe(
            map(products => {
                const counts: { [key: string]: number } = {};
                products.forEach(product => {
                    counts[product.garmentType] = (counts[product.garmentType] || 0) + 1;
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
            ...product
        };
        return this.http.post<ProductCustomizable>(`${this.apiUrl}/customizableProducts`, newProduct);
    }

    updateCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        return this.http.put<ProductCustomizable>(`${this.apiUrl}/customizableProducts/${product.id}`, product);
    }

    deleteCustomizableProduct(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/customizableProducts/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

} 
