import { Component } from '@angular/core';
import { AuthService } from '../../../services/authService';
import { BuyerCreateDto } from '../../../models/buyer.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ הוספה
import { EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../../../services/notificationService'; // ✅ הוספה


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
  
})
export class Register {

  @Output() success = new EventEmitter<void>();


  model: BuyerCreateDto = {
    identityNumber: '123456789',
    role: 0,
    name: '',
    password: '',
    email: '',
    phone: ''
  };

  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private notifyService:NotificationService) {} // ✅ הוספה

  handleError(err: any) {
    if (err?.status === 400 && err?.error?.message) {
      this.errorMessage = err.error.message;
      return;
    }

    if (err?.status === 400 && err?.error?.errors) {
      const messages = Object.values(err.error.errors).flat() as string[];
      this.errorMessage = messages.join(', ');
      return;
    }

    this.errorMessage = err?.message || 'Unexpected error. Please try again.';
  }
  register() {
    this.authService.register(this.model).subscribe({
      next: (response) => {
        this.notifyService.show('נרשמת בהצלחה!');
        this.router.navigate(['/gifts']);
      },
      error: (err) => {
        console.log('שגיאת רישום:', err);
        
        if (err.status === 400) {
          const errorMessage = err.error?.message || 'האימייל כבר קיים במערכת';
          this.notifyService.show(errorMessage);
        } else {
          this.notifyService.show('קרתה שגיאה בחיבור לשרת');
        }
      }
    });
  }
}