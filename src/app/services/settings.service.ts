import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

export interface AppSettings {
    secondColorPrice: number;
    customTextPrice: number;
    shippingPrice: number;
    freeShippingThreshold: number;
    whatsAppPhone?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getSettings(): Observable<AppSettings> {
        return this.http.get<AppSettings>(`${this.apiUrl}/settings`);
    }
    
    updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
        return this.http.get<AppSettings>(`${this.apiUrl}/settings`).pipe(
            map(currentSettings => {
                const updatedSettings = { ...currentSettings, ...settings };
                return this.http.put<AppSettings>(`${this.apiUrl}/settings`, updatedSettings);
            }),
            switchMap(observable => observable)
        );
    }

    getSecondColorPrice(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.secondColorPrice)
        );
    }

    getCustomTextPrice(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.customTextPrice)
        );
    }

    getShippingPrice(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.shippingPrice)
        );
    }

    getFreeShippingThreshold(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.freeShippingThreshold)
        );
    }

    getWhatsAppPhone(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.whatsAppPhone || '')
        );
    }

    updateWhatsAppPhone(phone: string): Observable<string> {
        return this.updateSettings({ whatsAppPhone: phone }).pipe(
            map(settings => settings.whatsAppPhone || '')
        );
    }

    updateFreeShippingThreshold(threshold: number): Observable<number> {
        return this.updateSettings({ freeShippingThreshold: threshold }).pipe(
            map(settings => settings.freeShippingThreshold)
        );
    }

} 