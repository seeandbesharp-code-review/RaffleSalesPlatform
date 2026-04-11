import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, throwError, tap } from 'rxjs';
import { AuthService } from './authService';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _cartGifts = signal<any[]>([]); 
  public cartItems = this._cartGifts.asReadonly();

  constructor(private http: HttpClient) {

  }

  isCartOpen = signal<boolean>(false);

  toggleCart(isOpen: boolean) {
    console.log('Service: משנה מצב סל ל-', isOpen);
    this.isCartOpen.set(isOpen);
  }
  getActiveCart() {
    return this.http.get<any>(`${environment.apiUrl}/cart/active`).pipe(
      tap(response => {
        let items = [];
        
        if (Array.isArray(response)) {
          items = response; 
        } else if (response && response.cartGifts) {
          items = response.cartGifts;
        } else if (response && response.items) {
          items = response.items; 
        }
  
        this._cartGifts.set([...items]);
        console.log('הסל התעדכן! מספר פריטים:', items.length);
      }),
      catchError(this.handleError)
    );
  }
  addGiftToActiveCart(giftId: number) {
    return this.http.post<any>(`${environment.apiUrl}/cart/active/add/${giftId}`, null)
      .pipe(
        tap(() => this.getActiveCart().subscribe()) 
      );
  }

  removeGiftFromActiveCart(giftId: number) {
    return this.http.delete<any>(`${environment.apiUrl}/cart/active/remove/${giftId}`)
      .pipe(
        tap(() => this.getActiveCart().subscribe()), 
        catchError(this.handleError)
      );
  }

  confirmActiveCart() {
    return this.http.post<void>(`${environment.apiUrl}/cart/active/confirm`, null)
      .pipe(
        tap(() => this._cartGifts.set([])), 
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = typeof error.error === 'string' ? error.error : (error.error?.message || 'שגיאת מערכת');
    return throwError(() => errorMessage);
  }

clearCart() {
  this._cartGifts.set([]);
}

updateItemQuantity(giftId: number, change: number): Observable<any> {
  if (change > 0) {
    return this.http.post(`${environment.apiUrl}/cart/active/add/${giftId}`, null);
  } else {
    return this.http.delete(`${environment.apiUrl}/cart/active/remove/${giftId}`);
  }
}
}