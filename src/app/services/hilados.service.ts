import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ThreadColor } from '../models/thread-color';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HiladosService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getHilados(): Observable<ThreadColor[]> {
        return this.http.get<ThreadColor[]>(`${this.apiUrl}${environment.endpoints.hilados}`);
    }

    createHilado(hilado: ThreadColor): Observable<ThreadColor> {
        const newHilado = {
            ...hilado
        };
        return this.http.post<ThreadColor>(`${this.apiUrl}${environment.endpoints.hilados}`, newHilado);
    }

    updateHilado(hilado: ThreadColor): Observable<ThreadColor> {
        return this.http.put<ThreadColor>(`${this.apiUrl}${environment.endpoints.hilados}/${hilado.id}`, hilado);
    }

    deleteHilado(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${environment.endpoints.hilados}/${id}`);
    }

    getHiladoById(id: number): Observable<ThreadColor | undefined> {
        return this.http.get<ThreadColor>(`${this.apiUrl}${environment.endpoints.hilados}/${id}`);
    }

} 