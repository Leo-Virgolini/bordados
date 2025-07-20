import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminUser } from '../model/admin-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    if (isLoggedIn === 'true' && userEmail) {
      this.currentUserSubject.next(new AdminUser({
        name: userEmail.split('@')[0],
        email: userEmail,
        isLoggedIn: true
      }));
    } else {
      this.currentUserSubject.next(null);
    }
  }

  login(email: string, password: string, rememberMe: boolean = false): boolean {
    // Mock authentication - replace with real API call
    if (email === 'admin@bordados.com' && password === '123456') {
      const user = new AdminUser({
        name: email.split('@')[0],
        email: email,
        isLoggedIn: true
      });

      // Store auth state
      if (rememberMe) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
      } else {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
      }

      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    // Clear all auth data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    return user?.isLoggedIn || false;
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.isLoggedIn();
  }
} 