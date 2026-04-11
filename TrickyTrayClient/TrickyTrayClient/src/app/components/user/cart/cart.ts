import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/cartService';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html', // שים לב: הורדתי את הסלאש בתחילת הנתיב
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {
  cart: any;

  // שינוי ל-public כדי שה-HTML יוכל לגשת ל-cartService.isCartOpen() אם צריך
  constructor(public cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getActiveCart().subscribe({
      next: (cart) => this.cart = cart,
      error: (err: any) => console.error('שגיאה בטעינת הסל:', err)
    });
  }

  get groupedItems() {
    if (!this.cart || !this.cart.items) return [];
    const map = new Map<number, any>();
    this.cart.items.forEach((item: any) => {
      if (map.has(item.giftId)) {
        map.get(item.giftId).quantity += 1;
      } else {
        map.set(item.giftId, { ...item, quantity: 1 });
      }
    });
    return Array.from(map.values());
  }

  // עדכון כמות - תיקון שגיאת ה-err
  updateQuantity(giftId: number, change: number) {
    // 1. מציאת הפריט במערך המקומי ועדכון ויזואלי מהיר
    const item = this.groupedItems.find(i => i.giftId === giftId);
    
    if (item) {
      const newQuantity = item.quantity + change;
      
      // מניעת ירידה מתחת ל-1
      if (newQuantity < 1) return;
  
      // 2. שליחה לשרת
      this.cartService.updateItemQuantity(giftId, change).subscribe({
        next: () => {
          // 3. רענון הנתונים האמיתיים מהשרת לאחר ההצלחה
          this.loadCart();
        },
        error: (err: any) => {
          console.error('שגיאה בעדכון כמות:', err);
          // כאן אפשר להוסיף הודעה למשתמש אם העדכון נכשל
        }
      });
    }
  }

  closeCart() {
    console.log("כפתור הסגירה נלחץ!");
    this.cartService.toggleCart(false);
  }

  goToCheckout() {
    this.closeCart(); 
    this.router.navigate(['/checkout']);
  }

  // פונקציות נוספות
  removeGroup(giftId: number) {
    this.cartService.removeGiftFromActiveCart(giftId).subscribe(() => this.loadCart());
  }

  confirm() {
    this.cartService.confirmActiveCart().subscribe(() => {
      alert('ההזמנה אושרה');
      this.loadCart();
    });
  }

  goBackToGifts() {
    this.router.navigate(['/gifts']);
  }
}