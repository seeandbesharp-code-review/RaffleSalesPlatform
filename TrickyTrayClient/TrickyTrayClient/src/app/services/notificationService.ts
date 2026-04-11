import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public message = signal<string | null>(null);
  public type = signal<'success' | 'error'>('success');

  show(text: string, type: 'success' | 'error' = 'success') {
    this.message.set(text);
    this.type.set(type);
    setTimeout(() => this.message.set(null), 3000);
  }
}