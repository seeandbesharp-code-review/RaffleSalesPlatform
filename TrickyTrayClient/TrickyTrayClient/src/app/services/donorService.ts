import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DonorService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7259/api/donor'; 
  getDonors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addDonor(donor: any): Observable<any> {
    return this.http.post(this.apiUrl, donor);
  }

  updateDonor(donor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${donor.id}`, donor); 
  }

  deleteDonor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  searchDonors(name?: string, email?: string, gift?: string) {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);
    if (gift) params = params.set('gift', gift);

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }
}