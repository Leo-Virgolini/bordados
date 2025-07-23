import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AppSettings {
    freeShippingThreshold: number;
    whatsappPhone: string;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private appSettings: AppSettings = {
        freeShippingThreshold: 50000,
        whatsappPhone: '+54 9 11 1234-5678'
    };

    // Get all settings
    getSettings(): Observable<AppSettings> {
        return of({ ...this.appSettings });
    }

    // Get free shipping threshold
    getFreeShippingThreshold(): Observable<number> {
        return of(this.appSettings.freeShippingThreshold);
    }

    // Update free shipping threshold
    updateFreeShippingThreshold(threshold: number): Observable<number> {
        const updatedSettings = { ...this.appSettings, freeShippingThreshold: threshold };
        this.appSettings = updatedSettings;
        return of(threshold);
    }

    // Update multiple settings
    updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
        const updatedSettings = { ...this.appSettings, ...settings };
        this.appSettings = updatedSettings;
        return of({ ...updatedSettings });
    }

    // Get WhatsApp phone number
    getWhatsAppPhone(): Observable<string> {
        return of(this.appSettings.whatsappPhone);
    }

    // Update WhatsApp phone number
    updateWhatsAppPhone(phone: string): Observable<string> {
        const updatedSettings = { ...this.appSettings, whatsappPhone: phone };
        this.appSettings = updatedSettings;
        return of(phone);
    }

} 