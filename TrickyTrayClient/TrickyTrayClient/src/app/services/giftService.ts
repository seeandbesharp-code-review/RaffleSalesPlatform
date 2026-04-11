import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GiftViewDto } from '../models/gift.model';

@Injectable({ providedIn: 'root' })
export class GiftService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7259/api/gift'; 
  getGifts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getGiftById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addGift(gift: any): Observable<any> {
    return this.http.post(this.apiUrl, gift);
  }

  updateGift(gift: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${gift.id}`, gift);
  }

  deleteGift(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  searchGifts(name?: string, donorName?: string, buyersCount?: number) {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (donorName) params = params.set('donorName', donorName);
    if (buyersCount) params = params.set('buyersCount', buyersCount.toString());

    return this.http.get<GiftViewDto[]>(`${this.apiUrl}/search`, { params });
  }

  getSortedGifts(sortBy: string) {
    const params = new HttpParams().set('sortBy', sortBy);
    return this.http.get<GiftViewDto[]>(`${this.apiUrl}/sort`, { params });
  }
}