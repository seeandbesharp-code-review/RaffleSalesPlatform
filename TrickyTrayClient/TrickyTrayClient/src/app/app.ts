import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationService } from './services/notificationService';
import { CommonModule } from '@angular/common'; // 1. ייבוא המודול
import { LayoutComponent } from './components/layout/layout';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, LayoutComponent], 
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {

  constructor(private router: Router) {}
  public notify = inject(NotificationService); 

  ngOnInit(): void {
    localStorage.clear();


    this.router.navigate(['/register']);
  }
}
