import { Component } from '@angular/core';
import { AuthService } from '../../../services/authService';
import { LoginRequestDto, LoginResponseDto } from '../../../models/auth.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/orderService'; // ✅ חדש
import { EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  @Output() success = new EventEmitter<void>();


  model: LoginRequestDto = {
    email: '',
    password: ''
  };

  constructor(
    private api: AuthService,
    private orderService: OrderService,   // ✅ חדש
    private router: Router
  ) { }

 // ... (Imports נשארים אותו דבר)

login() {
  this.api.login(this.model).subscribe({
    next: (response: LoginResponseDto) => {
      if (!response?.token) {
        alert('לא התקבל טוקן מהשרת');
        return;

      }

      this.api.saveToken(response.token);
      const buyerId = this.api.getBuyerIdFromToken();

      if (!buyerId) {
        alert('התחברת, אך לא זוהה מזהה משתמש');
        return;


      }

      this.orderService.createDraft(buyerId).subscribe({
        next: (orderId: number) => {
          localStorage.setItem('active_order_id', String(orderId));

          // בדיקה לאן לנווט:
          if (this.api.isAdmin()) {
            this.router.navigate(['/admin/manage-gifts']);
          } else {
            this.router.navigate(['/gifts']);
          }
          this.success.emit();

        },
        error: (err) => {
          console.error(err);
          alert('התחברת, אך יצירת סל נכשלה');
        }
      });
    },
    error: (err) => {
      console.error(err);
      alert('שגיאה בהתחברות');
    }
  });
}
}
