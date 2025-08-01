import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customer';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}`);
    }

    getCustomerById(id: number): Observable<Customer | undefined> {
        return this.http.get<Customer>(`${this.apiUrl}${environment.endpoints.customers}/${id}`);
    }

    createCustomer(customer: Omit<Customer, 'registrationDate'>): Observable<Customer> {
        const newCustomer = {
            ...customer,
            registrationDate: new Date().toISOString()
        };
        return this.http.post<Customer>(`${this.apiUrl}${environment.endpoints.customers}`, newCustomer);
    }

    updateCustomer(customer: Customer): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}${environment.endpoints.customers}/${customer.id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${environment.endpoints.customers}/${id}`);
    }

    searchCustomers(query: string): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}?q=${query}`);
    }

    getCustomersByProvince(province: string): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}?province=${province}`);
    }

    getNewCustomers(days: number = 30): Observable<Customer[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}?registrationDate_gte=${cutoffDate.toISOString()}`);
    }

    getCustomerCount(): Observable<number> {
        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}`).pipe(
            map(customers => customers.length)
        );
    }

    getNewCustomerCount(days: number = 30): Observable<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.http.get<Customer[]>(`${this.apiUrl}${environment.endpoints.customers}?registrationDate_gte=${cutoffDate.toISOString()}`).pipe(
            map(customers => customers.length)
        );
    }

} 