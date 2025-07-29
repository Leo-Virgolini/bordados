import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ThreadColor } from '../models/thread-color';
import { delay, map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HiladosService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getHilados(): Observable<ThreadColor[]> {
        return this.http.get<ThreadColor[]>(`${this.apiUrl}/hilados`);
    }

    getSecondColorPrice(): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
            map(settings => settings.secondColorPrice || 1500)
        );
    }

    getCustomTextPrice(): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
            map(settings => settings.customTextPrice || 3000)
        );
    }

    setCustomTextPrice(price: number): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
            map(settings => {
                const updatedSettings = { ...settings, customTextPrice: price };
                return this.http.put<any>(`${this.apiUrl}/settings`, updatedSettings).pipe(
                    map(() => price)
                );
            }),
            switchMap(observable => observable)
        );
    }

    setSecondColorPrice(price: number): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
            map(settings => {
                const updatedSettings = { ...settings, secondColorPrice: price };
                return this.http.put<any>(`${this.apiUrl}/settings`, updatedSettings).pipe(
                    map(() => price)
                );
            }),
            switchMap(observable => observable)
        );
    }

    createHilado(hilado: ThreadColor): Observable<ThreadColor> {
        const newHilado = {
            ...hilado,
            id: this.generateId()
        };
        return this.http.post<ThreadColor>(`${this.apiUrl}/hilados`, newHilado);
    }

    updateHilado(hilado: ThreadColor): Observable<ThreadColor> {
        return this.http.put<ThreadColor>(`${this.apiUrl}/hilados/${hilado.id}`, hilado);
    }

    deleteHilado(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/hilados/${id}`);
    }

    getHiladoById(id: string): Observable<ThreadColor | undefined> {
        return this.http.get<ThreadColor>(`${this.apiUrl}/hilados/${id}`);
    }

    private generateId(): string {
        return Date.now().toString();
    }
} 