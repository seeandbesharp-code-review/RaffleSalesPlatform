import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BuyerCreateDto } from '../models/buyer.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequestDto } from '../models/auth.model';
import { CartService } from './cartService';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly tokenKey = 'auth_token';
    
    private userProfile = new BehaviorSubject<any>(this.decodeToken());
    public currentUser$ = this.userProfile.asObservable();

    private adminStatus = new BehaviorSubject<boolean>(this.checkAdminStatus());
    public isAdmin$ = this.adminStatus.asObservable();

    private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$ = this.loggedIn.asObservable();

    constructor(private http: HttpClient
 ) { }

private loginModalVisible = new BehaviorSubject<boolean>(false);
public loginModalVisible$ = this.loginModalVisible.asObservable();

openLoginModal() { this.loginModalVisible.next(true); }
closeLoginModal() { this.loginModalVisible.next(false); }
    register(data: BuyerCreateDto): Observable<any> {
        return this.http.post(`${environment.apiUrl}/Buyer`, data);
    }

    login(data: LoginRequestDto): Observable<any> {
        return this.http.post(`${environment.apiUrl}/Auth/Login`, data);
    }

    saveToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
        
        this.loggedIn.next(true);
        this.adminStatus.next(this.checkAdminStatus());
        this.userProfile.next(this.decodeToken());
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        
        this.loggedIn.next(false);
        this.adminStatus.next(false);
        this.userProfile.next(null);
    
    
    }

    isAdmin(): boolean {
        return this.adminStatus.value;
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private hasToken(): boolean {
        return !!this.getToken();
    }

    private decodeToken(): any {
        const token = this.getToken();
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload;
        } catch { 
            return null; 
        }
    }

    private checkAdminStatus(): boolean {
        const payload = this.decodeToken();
        if (!payload) return false;
        
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
        return ['manager', 'admin', 'Manager', 'Admin'].includes(role);
    }

    getBuyerIdFromToken(): number | null {
        const payload = this.decodeToken();
        if (!payload) return null;
        const raw = payload?.sub ?? payload?.nameid ?? payload?.BuyerId ?? payload?.buyerId;
        return Number(raw) || null;
    }

isLoggedIn(): boolean {
    return this.loggedIn.value;
}
}