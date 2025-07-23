import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ThreadColor } from '../model/thread-color';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HiladosService {

    private hilados: ThreadColor[] = [
        new ThreadColor({ id: '1', name: 'Rojo Fuego', code: '#FF0000', stock: 150, active: true }),
        new ThreadColor({ id: '2', name: 'Azul Marino', code: '#000080', stock: 200, active: true }),
        new ThreadColor({ id: '3', name: 'Verde Bosque', code: '#228B22', stock: 120, active: true }),
        new ThreadColor({ id: '4', name: 'Negro', code: '#000000', stock: 300, active: true }),
        new ThreadColor({ id: '5', name: 'Blanco', code: '#FFFFFF', stock: 250, active: true })
    ];

    private secondColorPrice: number = 1500;

    getHilados(): Observable<ThreadColor[]> {
        return of(this.hilados);
    }

    getSecondColorPrice(): Observable<number> {
        return of(this.secondColorPrice);
    }

    setSecondColorPrice(price: number): Observable<number> {
        this.secondColorPrice = price;
        return of(this.secondColorPrice);
    }

    createHilado(hilado: ThreadColor): Observable<ThreadColor> {
        const newHilado = new ThreadColor({
            ...hilado,
            id: this.generateId()
        });
        this.hilados.push(newHilado);
        return of(newHilado).pipe(delay(500));
    }

    updateHilado(hilado: ThreadColor): Observable<ThreadColor> {
        const index = this.hilados.findIndex(h => h.id === hilado.id);
        if (index !== -1) {
            this.hilados[index] = new ThreadColor(hilado);
            return of(this.hilados[index]);
        }
        throw new Error('Hilado no encontrado');
    }

    deleteHilado(id: string): Observable<void> {
        const index = this.hilados.findIndex(h => h.id === id);
        if (index !== -1) {
            this.hilados.splice(index, 1);
            return of(void 0);
        }
        throw new Error('Hilado no encontrado');
    }

    getHiladoById(id: string): Observable<ThreadColor | undefined> {
        const hilado = this.hilados.find(h => h.id === id);
        return of(hilado);
    }
    
    private generateId(): string {
        const maxId = this.hilados
            .map(h => Number(h.id))
            .filter(id => !isNaN(id))
            .reduce((max, id) => Math.max(max, id), 0);
        return (maxId + 1).toString();
    }
} 