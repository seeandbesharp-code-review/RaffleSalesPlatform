import { Component, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common'; 
import { AuthService } from '../../../services/authService';
import { CartService } from '../../../services/cartService';
import { AuthModalComponent} from '../auth-modal/auth-modal';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [RouterLink, AsyncPipe, CommonModule, AuthModalComponent]
})
export class HeaderComponent implements OnInit {

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public router: Router
  ) {}

  showAuthModal = false;



openAuthModal() {
  this.authService.openLoginModal();
}

closeAuthModal() {
  this.authService.closeLoginModal();
}


  ngOnInit(): void {
    // טעינה ראשונית
    if (this.authService.isLoggedIn()) 
    this.cartService.getActiveCart().subscribe();

    // כאן אנחנו פותרים את הבעיה של "מתחברת ורואה 0":
    // אנחנו מאזינים לשינוי בסטטוס ההתחברות וקוראים לסל
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.cartService.getActiveCart().subscribe();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCart(); // כאן אנחנו פותרים את הבעיה של האיפוס ב-logout
    this.router.navigate(['/login']);
  }

  // סיגנל מחושב שמתעדכן אוטומטית כשהסרוויס משתנה
// header.ts
cartCount = computed(() => {
  const items = this.cartService.cartItems(); // קריאה ל-Readonly Signal
  return items ? items.length : 0;
});

handleUserClick() {
  // אם המשתמש לא מחובר, נפתח את המודאל
  if (!this.authService.isLoggedIn()) {
    this.openAuthModal();
  } else {
    // כאן תוכל להוסיף ניווט לדף "החשבון שלי" אם תרצה בעתיד
    console.log('המשתמש כבר מחובר');
  }
}
}