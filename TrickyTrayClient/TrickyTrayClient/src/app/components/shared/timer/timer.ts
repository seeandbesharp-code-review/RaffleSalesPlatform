import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
  // כאן אין צורך ב-standalone: true כי זה ה-default בגרסה שלך
  imports: [CommonModule],
  templateUrl: './timer.html', // ודאי שזה השם המדויק של הקובץ
  styleUrls: ['./timer.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  private timerInterval: any;
  targetDate = new Date().getTime() + (3 * 24 * 60 * 60 * 1000);
  
  days = 0; hours = 0; minutes = 0; seconds = 0;

  ngOnInit() {
    this.update();
    this.timerInterval = setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date().getTime();
    const diff = this.targetDate - now;
    if (diff > 0) {
      this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}