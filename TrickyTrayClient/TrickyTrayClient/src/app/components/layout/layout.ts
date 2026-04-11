import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common'; // ייבוא חובה ל-AsyncPipe
import { map } from 'rxjs/operators';

// ייבוא הקומפוננטות שלך
import { TimerComponent } from '../shared/timer/timer'; 
import { HeaderComponent } from '../shared/header/header'; 
import { FooterComponent } from '../shared/footer/footer'; 
import { Cart } from '../user/cart/cart'; 

// ייבוא השירותים
import { AuthService } from '../../services/authService';
import { CartService } from '../../services/cartService';
import { SystemStateService } from '../../services/systemStateService';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,   // מאפשר שימוש ב-Pipes ובדיקות בסיסיות
    AsyncPipe,      // פותר את השגיאה ב-HTML
    RouterOutlet,
    TimerComponent,
    HeaderComponent,
    FooterComponent,
    Cart
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
  // הזרקת שירותים בצורה מודרנית (פותר את שגיאת ה-initialization)
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private systemService = inject(SystemStateService);
  private cdr = inject(ChangeDetectorRef);

  showCart = false;

  // הגדרת ה-Observable לבדיקת סטטוס המכירה
  isSaleActive$ = this.systemService.getState().pipe(
    map(state => {
      const s = state?.status?.toString().toLowerCase().trim();
      console.log("סטטוס נוכחי ב-Layout:", s);
  
      // הטימר יופיע אם המכירה בסטטוס 1, או active, או pending
      // והוא יעלם אם הסטטוס הוא 2, או finished, או ended
      const isFinished = (s === 'finished' || s === '2' || s === 'ended');
      
      return !isFinished; // תציג את הטימר כל עוד המכירה לא הסתיימה
    })
  );

  constructor() {
    // שימוש ב-effect למעקב אחרי מצב הסל
    effect(() => {
      this.showCart = this.cartService.isCartOpen();
      console.log('Layout קיבל עדכון לסל: ', this.showCart);
      // במידה והעדכון לא נצפה ב-HTML, ה-CDR מוודא רענון
      this.cdr.detectChanges();
    });
  }

  // Getter לגישה נוחה מה-HTML
  get isCartOpen() {
    return this.cartService.isCartOpen();
  }
}