import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftService } from '../../../services/giftService';
import { CartService } from '../../../services/cartService';
import { AuthService } from '../../../services/authService';
import { DonorService } from '../../../services/donorService'; // ייבוא חובה לתורמים
import { GiftViewDto } from '../../../models/gift.model';
import { RouterLink, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { NotificationService } from '../../../services/notificationService'; 
import { SystemStateService } from '../../../services/systemStateService';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gifts-list.html',
  styleUrl: './gifts-list.scss'
})
export class GiftsListComponent implements OnInit {
  private giftService = inject(GiftService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private donorService = inject(DonorService);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private systemService = inject(SystemStateService);

  currentStatus = signal<string>(''); 
  gifts = signal<GiftViewDto[]>([]);
  donors = signal<any[]>([]);
  winners = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage: string = '';

  ngOnInit() {
    this.checkSystemState();
  }

  
  checkSystemState() {
    this.systemService.getState().subscribe({
      next: (state: any) => {
        const s = (state?.status || '').toString().toLowerCase().trim();
        this.currentStatus.set(s);
        console.log("System Status Identified:", s);

        if (s === 'active') {
          this.loadGifts();
        } 
        else if (s === 'finished') {
          this.loadWinnersFromApi(); 
          this.loadDonors();
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching state:', err);
        this.isLoading.set(false);
      }
    });
  }


  loadGifts() {
    this.giftService.getGifts().subscribe({
      next: (res) => this.gifts.set(res),
      error: (err) => console.error('שגיאה בטעינת המתנות:', err)
    });
  }

 
  loadDonors() {
    this.donorService.getDonors().subscribe({
      next: (res) => {
        console.log('Donors for Honor Roll:', res);
        this.donors.set(res ?? []);
      },
      error: (err) => console.error('שגיאה בטעינת תורמים:', err)
    });
  }


  loadWinnersFromApi() {
    this.systemService.getWinners().subscribe({
      next: (res) => this.winners.set(res ?? []),
      error: (err) => console.error('שגיאה בטעינת זוכים:', err)
    });
  }


  navigateToGift(giftId: number) {
    this.router.navigate(['/gift', giftId]);
  }

  addToCart(giftId: number) {
    if (!this.authService.isLoggedIn()) {
      this.authService.openLoginModal();
      return;
    }

    this.cartService.addGiftToActiveCart(giftId).subscribe({
      next: () => {
        this.notify.show('המתנה נוספה לסל בהצלחה!', 'success');
      },
      error: (err) => this.handleServerError(err)
    });
  }

  private handleServerError(err: any) {
    if (err.status === 401 || !this.authService.isLoggedIn()) {
      this.authService.openLoginModal();
    } else {
      this.notify.show(err.error?.message || 'שגיאה בביצוע הפעולה', 'error');
    }
  }

  searchName = '';
  searchDonor = '';

  onSearch() {
    this.giftService.searchGifts(this.searchName, this.searchDonor)
      .subscribe(res => this.gifts.set(res));
  }

  onSort(criteria: string) {
    this.giftService.getSortedGifts(criteria)
      .subscribe(res => this.gifts.set(res));
  }
}