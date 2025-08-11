import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AppSettings {
    secondColorPrice: number;
    customTextPrice: number;
    freeShippingThreshold: number;
    whatsAppPhone: string;
    maxImageSize: number;
    maxTextLength: number;
    facebookUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    tiktokUrl: string;
    discountPercentage: number;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getSettings(): Observable<AppSettings> {
        return this.http.get<AppSettings>(`${this.apiUrl}${environment.endpoints.settings}`);
    }

    updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
        return this.http.get<AppSettings>(`${this.apiUrl}${environment.endpoints.settings}`).pipe(
            map(currentSettings => {
                const updatedSettings = { ...currentSettings, ...settings };
                return this.http.put<AppSettings>(`${this.apiUrl}${environment.endpoints.settings}`, updatedSettings);
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

    getFreeShippingThreshold(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.freeShippingThreshold)
        );
    }

    getWhatsAppPhone(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.whatsAppPhone)
        );
    }

    getMaxImageSize(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.maxImageSize)
        );
    }

    updateWhatsAppPhone(phone: string): Observable<string> {
        return this.updateSettings({ whatsAppPhone: phone }).pipe(
            map(settings => settings.whatsAppPhone)
        );
    }

    updateFreeShippingThreshold(threshold: number): Observable<number> {
        return this.updateSettings({ freeShippingThreshold: threshold }).pipe(
            map(settings => settings.freeShippingThreshold)
        );
    }

    updateSecondColorPrice(price: number): Observable<number> {
        return this.updateSettings({ secondColorPrice: price }).pipe(
            map(settings => settings.secondColorPrice)
        );
    }

    updateCustomTextPrice(price: number): Observable<number> {
        return this.updateSettings({ customTextPrice: price }).pipe(
            map(settings => settings.customTextPrice)
        );
    }

    updateMaxImageSize(size: number): Observable<number> {
        return this.updateSettings({ maxImageSize: size }).pipe(
            map(settings => settings.maxImageSize)
        );
    }

    updateMaxTextLength(length: number): Observable<number> {
        return this.updateSettings({ maxTextLength: length }).pipe(
            map(settings => settings.maxTextLength)
        );
    }

    getDiscountPercentage(): Observable<number> {
        return this.getSettings().pipe(
            map(settings => settings.discountPercentage)
        );
    }

    updateDiscountPercentage(percentage: number): Observable<number> {
        return this.updateSettings({ discountPercentage: percentage }).pipe(
            map(settings => settings.discountPercentage)
        );
    }

    // Social Media URLs
    getFacebookUrl(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.facebookUrl || '')
        );
    }

    getInstagramUrl(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.instagramUrl || '')
        );
    }

    getTwitterUrl(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.twitterUrl || '')
        );
    }

    getTikTokUrl(): Observable<string> {
        return this.getSettings().pipe(
            map(settings => settings.tiktokUrl || '')
        );
    }

    updateFacebookUrl(url: string): Observable<string> {
        return this.updateSettings({ facebookUrl: url }).pipe(
            map(settings => settings.facebookUrl)
        );
    }

    updateInstagramUrl(url: string): Observable<string> {
        return this.updateSettings({ instagramUrl: url }).pipe(
            map(settings => settings.instagramUrl)
        );
    }

    updateTwitterUrl(url: string): Observable<string> {
        return this.updateSettings({ twitterUrl: url }).pipe(
            map(settings => settings.twitterUrl)
        );
    }

    updateTikTokUrl(url: string): Observable<string> {
        return this.updateSettings({ tiktokUrl: url }).pipe(
            map(settings => settings.tiktokUrl)
        );
    }

} 