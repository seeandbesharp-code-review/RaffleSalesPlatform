import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DonorService } from '../../../services/donorService';
import { SystemStateService } from '../../../services/systemStateService';

@Component({
  selector: 'app-admin-donors',
  standalone: true, 
  imports: [NgFor, NgIf, FormsModule, AsyncPipe],
  templateUrl: './admin-donors.html',
  styleUrl: './admin-donors.scss',
})
export class AdminDonors implements OnInit {
  private donorService = inject(DonorService);
  private systemStateService = inject(SystemStateService);
  
  donors = signal<any[]>([]);
  selectedDonor: any = { name: '', email: '', phone: '' };
  
  showForm = false;

  filterName = '';
  filterEmail = '';
  filterGift = '';

  isLocked = false;
  state$ = this.systemStateService.getState();

  ngOnInit() { 
    this.loadDonors();
    this.listenToSystemStatus();
  }

  private listenToSystemStatus() {
    this.state$.subscribe(state => {
      const s = state?.status?.toString().toLowerCase();
      this.isLocked = (s == '1' || s == '2' || s == 'active' || s == 'finished');
      console.log('System is locked:', this.isLocked);
    });
  }

  loadDonors() {
    this.donorService.getDonors().subscribe({
      next: (res) => this.donors.set(res),
      error: (err) => alert('שגיאה בטעינת תורמים: ' + err.message)
    });
  }

  /**
   * פונקציה לפתיחת הדיאלוג (מודאל) - פותרת את השגיאה ב-HTML
   */
  openDonorDialog(donor?: any) {
    if (this.isLocked) return;
    
    if (donor) {
      this.selectedDonor = { ...donor }; // עריכה
    } else {
      this.selectedDonor = { name: '', email: '', phone: '' }; // הוספה חדשה
    }
    this.showForm = true;
  }

  /**
   * סגירת המודאל
   */
  closeForm() {
    this.showForm = false;
    this.selectedDonor = { name: '', email: '', phone: '' };
  }

  save() {
    if (this.isLocked) return;

    const request = this.selectedDonor.id 
      ? this.donorService.updateDonor(this.selectedDonor)
      : this.donorService.addDonor(this.selectedDonor);

    request.subscribe({
      next: () => {
        this.loadDonors();
        this.closeForm();
        alert('הפעולה בוצעה בהצלחה');
      },
      error: (err) => alert(err.message)
    });
  }

  delete(id: number) {
    if (this.isLocked) return;
    if (confirm('האם את בטוחה שברצונך למחוק תורם זה?')) {
      this.donorService.deleteDonor(id).subscribe({
        next: () => this.loadDonors(),
        error: (err) => alert('שגיאה במחיקה: ' + err.message)
      });
    }
  }

  onSearch() {
    this.donorService.searchDonors(this.filterName, this.filterEmail, this.filterGift)
      .subscribe({
        next: (res) => this.donors.set(res),
        error: (err) => console.error('שגיאה בחיפוש:', err)
      });
  }

  reset() {
    this.filterName = '';
    this.filterEmail = '';
    this.filterGift = '';
    this.loadDonors();
  }
}