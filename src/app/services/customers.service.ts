import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customer';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {

    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
    }

    getCustomerById(id: number): Observable<Customer | undefined> {
        return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
    }

    createCustomer(customer: Omit<Customer, 'registrationDate'>): Observable<Customer> {
        const newCustomer = {
            ...customer,
            registrationDate: new Date().toISOString()
        };
        return this.http.post<Customer>(`${this.apiUrl}/customers`, newCustomer);
    }

    updateCustomer(customer: Customer): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}/customers/${customer.id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
    }

    searchCustomers(query: string): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers?q=${query}`);
    }

    getCustomersByProvince(province: string): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers?province=${province}`);
    }

    getNewCustomers(days: number = 30): Observable<Customer[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.http.get<Customer[]>(`${this.apiUrl}/customers?registrationDate_gte=${cutoffDate.toISOString()}`);
    }

    getCustomerCount(): Observable<number> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers`).pipe(
            map(customers => customers.length)
        );
    }

    getNewCustomerCount(days: number = 30): Observable<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.http.get<Customer[]>(`${this.apiUrl}/customers?registrationDate_gte=${cutoffDate.toISOString()}`).pipe(
            map(customers => customers.length)
        );
    }

} 