import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductType } from '../model/product-type';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProductTypesService {

    private productTypes: ProductType[] = [
        new ProductType({
            id: '1',
            name: 'Remera Básica',
            description: 'Remera de algodón 100% con bordado personalizable',
            price: 15000,
            sizes: ['S', 'M', 'L', 'XL'],
            stock: { 'S': 50, 'M': 75, 'L': 60, 'XL': 40 },
            active: true
        }),
        new ProductType({
            id: '2',
            name: 'Buzo con Capucha',
            description: 'Buzo de frisa con capucha y bordado personalizable',
            price: 25000,
            sizes: ['M', 'L', 'XL', 'XXL'],
            stock: { 'M': 30, 'L': 45, 'XL': 35, 'XXL': 25 },
            active: true
        })
    ];

    getProductTypes(): Observable<ProductType[]> {
        return of(this.productTypes);
    }

    createProductType(productType: ProductType): Observable<ProductType> {
        const newProductType = new ProductType({
            ...productType,
            id: this.generateId()
        });
        this.productTypes.push(newProductType);
        return of(newProductType).pipe(delay(500));
    }

    updateProductType(productType: ProductType): Observable<ProductType> {
        const index = this.productTypes.findIndex(pt => pt.id === productType.id);
        if (index !== -1) {
            this.productTypes[index] = new ProductType(productType);
            return of(this.productTypes[index]);
        }
        throw new Error('Tipo de producto no encontrado');
    }

    deleteProductType(id: string): Observable<void> {
        const index = this.productTypes.findIndex(pt => pt.id === id);
        if (index !== -1) {
            this.productTypes.splice(index, 1);
            return of(void 0);
        }
        throw new Error('Tipo de producto no encontrado');
    }

    getProductTypeById(id: string): Observable<ProductType | undefined> {
        const productType = this.productTypes.find(pt => pt.id === id);
        return of(productType);
    }

    private generateId(): string {
        const maxId = this.productTypes
            .map(pt => Number(pt.id))
            .filter(id => !isNaN(id))
            .reduce((max, id) => Math.max(max, id), 0);
        return (maxId + 1).toString();
    }

} 