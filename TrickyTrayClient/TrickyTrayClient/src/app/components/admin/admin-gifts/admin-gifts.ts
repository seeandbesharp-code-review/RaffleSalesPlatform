import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { GiftService } from '../../../services/giftService';
import { DonorService } from '../../../services/donorService';
import { SystemStateService } from '../../../services/systemStateService';
import { GiftViewDto } from '../../../models/gift.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-gifts',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, AsyncPipe],
  templateUrl: './admin-gifts.html',
  styleUrl: './admin-gifts.scss',
})
export class AdminGiftsComponent implements OnInit {
  private giftService = inject(GiftService);
  private donorService = inject(DonorService);
  private systemStateService = inject(SystemStateService);
  
  gifts = signal<GiftViewDto[]>([]);
  donors = signal<any[]>([]);
  selectedGift: any = { name: '', price: 0, category: '', donorId: null };
  
  isLocked: boolean = false; 
  showForm: boolean = false;
  
  state$ = this.systemStateService.getState();

  ngOnInit() { 
    this.loadGifts(); 
    this.loadDonors();
    
    this.state$.subscribe(state => {
      if (state) {
        const s = state.status?.toString().toLowerCase();
        this.isLocked = (s == '1' || s == '2' || s === 'active' || s === 'finished');
      }
    });
  }

  /**
   * בדיקה בזמן אמת (כמו בניהול תורמים)
   */
  private async getIsLocked(): Promise<boolean> {
    try {
      const state = await firstValueFrom(this.state$);
      const s = state?.status?.toString().toLowerCase();
      return (s == '1' || s == '2' || s == 'active' || s == 'finished');      
    } catch (e) {
      return false; 
    }
  }

  loadGifts() {
    this.giftService.getGifts().subscribe(res => this.gifts.set(res));
  }

  loadDonors() {
    this.donorService.getDonors().subscribe(data => this.donors.set(data));
  }

  async openGiftDialog(gift?: any) {
    if (await this.getIsLocked()) return; 
    
    this.selectedGift = gift ? { ...gift } : { name: '', price: 0, category: null, donorId: null };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.reset();
  }

  async save() {
    if (await this.getIsLocked()) return;

    if (this.selectedGift.id) {
      this.giftService.updateGift(this.selectedGift).subscribe(() => {
        this.closeForm();
        this.loadGifts();
      });
    } else {
      this.giftService.addGift(this.selectedGift).subscribe(() => {
        this.closeForm();
        this.loadGifts();
      });
    }
  }

  async delete(id: number) {
    if (await this.getIsLocked()) return;
    if (confirm('בטוח שברצונך למחוק מתנה זו?')) {
      this.giftService.deleteGift(id).subscribe(() => this.loadGifts());
    }
  }

  reset() {
    this.selectedGift = { name: '', price: 0, category: '', donorId: null };
  }
}