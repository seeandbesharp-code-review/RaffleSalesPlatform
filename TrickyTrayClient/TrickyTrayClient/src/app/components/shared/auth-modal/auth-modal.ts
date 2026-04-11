import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Login } from '../login/login';
import { Register } from '../../user/register/register';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, Login, Register],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.scss']
})
export class AuthModalComponent {

  mode: 'login' | 'register' = 'login';

  @Output() close = new EventEmitter<void>();

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  closeModal() {
    this.close.emit();
  }
}
