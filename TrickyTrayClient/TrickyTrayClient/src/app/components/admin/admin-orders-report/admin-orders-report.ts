import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/orderService';

@Component({
  selector: 'app-admin-orders-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders-report.html',
  styleUrls: ['./admin-orders-report.scss']
})
export class AdminOrdersReport implements OnInit {
  
  reports = signal<any[]>([]);
  totalRevenue = signal<number>(0);
  currentSort: string = 'quantity'; 
  selectedGiftForModal = signal<any>(null);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadReports('quantity');
    this.fetchTotalRevenue();
  }

  loadReports(sortBy: string) {
    this.currentSort = sortBy;
    this.orderService.getSortedReports(sortBy).subscribe({
      next: (data) => {
        // הנתונים מגיעים כבר מקובצים: GiftId, GiftName, Price, PurchaseCount, Purchasers
        this.reports.set(data);
      },
      error: (err) => console.log('שגיאה בטעינת הדוח:', err)
    });
  }

  fetchTotalRevenue() {
    this.orderService.getTotalRevenue().subscribe(res => {
      this.totalRevenue.set(res.totalRevenue || 0);
    });
  }

  viewBuyers(item: any) {
    this.selectedGiftForModal.set(item);
  }

  closeModal() {
    this.selectedGiftForModal.set(null);
  }
}