import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CartService } from '../../../services/cartService';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cart = signal<any>(null);
  currentStep = 1; // 1: סיכום הזמנה, 2: פרטי תשלום
  paymentForm: FormGroup;

  // קיבוץ הפריטים לצורך תצוגה ברורה בדף הסיכום
  groupedItems = computed(() => {
    const data = this.cart();
    if (!data || !data.items) return [];
    const map = new Map<number, any>();
    data.items.forEach((item: any) => {
      if (map.has(item.giftId)) map.get(item.giftId).qty += 1;
      else map.set(item.giftId, { ...item, qty: 1 });
    });
    return Array.from(map.values());
  });

  constructor() {
    this.paymentForm = this.fb.group({
      fullName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
    });
  }

  ngOnInit() {
    this.cartService.getActiveCart().subscribe(data => this.cart.set(data));
  }

  nextStep() { this.currentStep = 2; }
  prevStep() { this.currentStep = 1; }

  finishOrder() {
    if (this.paymentForm.valid) {
      this.cartService.confirmActiveCart().subscribe(() => {
        alert('ההזמנה בוצעה בהצלחה!');
        this.router.navigate(['/']);
      });
    }
  }
}