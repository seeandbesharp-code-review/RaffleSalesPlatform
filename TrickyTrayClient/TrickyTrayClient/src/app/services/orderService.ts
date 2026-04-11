import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  createDraft(buyerId: number) {
    return this.http
      .post<{ orderId: number }>(`${environment.apiUrl}/order/create/${buyerId}`, null)
      .pipe(map(res => res.orderId));
  }

getSortedReports(sortBy: string): Observable<any[]> {
  const cacheBuster = new Date().getTime();
  return this.http.get<any[]>(`${environment.apiUrl}/order/purchases/sorted?sortBy=${sortBy}`);
}

getTotalRevenue(): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/raffle/total-revenue`);
}
}
