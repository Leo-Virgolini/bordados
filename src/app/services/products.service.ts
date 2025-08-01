import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProductEmbroided } from '../models/product-embroided';
import { ProductCustomizable } from '../models/product-customizable';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}`);
    }

    getEmbroidedProductById(id: number): Observable<ProductEmbroided | undefined> {
        return this.http.get<ProductEmbroided>(`${this.apiUrl}${environment.endpoints.products.embroided}/${id}`);
    }

    createEmbroidedProduct(product: ProductEmbroided): Observable<ProductEmbroided> {
        const newProduct = {
            ...product
        };
        return this.http.post<ProductEmbroided>(`${this.apiUrl}${environment.endpoints.products.embroided}`, newProduct);
    }

    updateEmbroidedProduct(product: ProductEmbroided): Observable<ProductEmbroided> {
        return this.http.put<ProductEmbroided>(`${this.apiUrl}${environment.endpoints.products.embroided}/${product.id}`, product);
    }

    deleteEmbroidedProduct(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}${environment.endpoints.products.embroided}/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    searchEmbroidedProducts(query: string): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}?q=${query}`);
    }

    getEmbroidedProductsByCategory(category: string): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}?garmentType=${category}`);
    }

    getFeaturedEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}?isFeatured=true`);
    }

    getNewEmbroidedProducts(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}?isNew=true`);
    }

    getEmbroidedProductsOnSale(): Observable<ProductEmbroided[]> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}?discount_gt=0`);
    }

    getLowStockEmbroidedProducts(): Observable<ProductEmbroided[]> {
        // Note: This is a simplified version. In a real API, you might need a custom endpoint
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}`).pipe(
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
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}`).pipe(
            map(products => products.length)
        );
    }

    getEmbroidedProductsCountByCategory(): Observable<{ [key: string]: number }> {
        return this.http.get<ProductEmbroided[]>(`${this.apiUrl}${environment.endpoints.products.embroided}`).pipe(
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
        return this.http.get<ProductCustomizable[]>(`${this.apiUrl}${environment.endpoints.products.customizable}`);
    }

    createCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        const newProduct = {
            ...product
        };
        return this.http.post<ProductCustomizable>(`${this.apiUrl}${environment.endpoints.products.customizable}`, newProduct);
    }

    updateCustomizableProduct(product: ProductCustomizable): Observable<ProductCustomizable> {
        return this.http.put<ProductCustomizable>(`${this.apiUrl}${environment.endpoints.products.customizable}/${product.id}`, product);
    }

    deleteCustomizableProduct(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}${environment.endpoints.products.customizable}/${id}`).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

} 
