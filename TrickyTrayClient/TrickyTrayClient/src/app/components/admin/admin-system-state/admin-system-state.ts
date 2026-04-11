import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { SystemStateService, WinnerDto } from '../../../services/systemStateService';
import { NotificationService } from '../../../services/notificationService'; // הסרוויס של הה

@Component({
  selector: 'app-admin-system-state',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-system-state.html',
  styleUrl: './admin-system-state.scss',
})
export class AdminSystemState {

  winners: WinnerDto[] = [];
  message = '';

  constructor(private systemStateService: SystemStateService, private notifyService: NotificationService) {}

  onStartButtonClick() {
    this.systemStateService.startSale().subscribe({
      next: (res) => {
        this.message = res.message;
        this.notifyService.show('המכירה הופעלה בהצלחה!');
      },
      error: (err) =>  this.notifyService.show('שגיאה בהפעלת המכירה: ' + err.message),
    });
  }

  onFinishButtonClick() {
    this.systemStateService.finishSale().subscribe({
      next: (res) => {
        this.message = res.message;
        this.winners = res.winners ?? [];
      },
      error: (err) =>  this.notifyService.show('שגיאה בסיום המכירה: ' + err.message),
    });
  }

  onResetButtonClick() {
    this.systemStateService.reset().subscribe({
      next: (res) => {
        this.message = res.message;
        this.winners = [];
      },
      error: (err) => alert(err.message),
    });
  }
}