import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GiftService } from '../../../services/giftService';
import { CartService } from '../../../services/cartService';

@Component({
  selector: 'app-gift-details',
  imports: [RouterLink], 
  templateUrl: './gift-details.html',
  styleUrl: './gift-details.scss'
})
export class GiftDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private giftService = inject(GiftService);
  private cartService = inject(CartService);

  gift = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.giftService.getGiftById(id).subscribe({
        next: (data) => this.gift.set(data),
        error: (err) => console.error('שגיאה:', err)
      });
    }
  }

  addToCart(giftId: number) {
    this.cartService.addGiftToActiveCart(giftId).subscribe({
      next: () => alert('נוסף לסל בהצלחה!'),
      error: (err) => alert(err.message)
    });
  }
}