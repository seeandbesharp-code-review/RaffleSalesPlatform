import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { RaffleReportDto } from '../models/raffle-report.model';

export interface WinnerDto {
  giftName: string;
  winnerName: string; 
}
export interface FinishSaleResponse {
  message: string;
  winners: WinnerDto[];
}

export interface SystemStateDto {
  id: number;
  status: number;       
  startTime?: string;
  endTime?: string;
}

@Injectable({ providedIn: 'root' })
export class SystemStateService {

  constructor(private http: HttpClient) {}

  private _state$ = new BehaviorSubject<SystemStateDto | null>(null);
  public state$ = this._state$.asObservable();

  getState(): Observable<SystemStateDto> {
    return this.http
      .get<SystemStateDto>(`${environment.apiUrl}/system-state`)
      .pipe(tap(s => this._state$.next(s)));
  }

  startSale(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/system-state/start`, null)
      .pipe(tap(() => this.getState().subscribe()));
  }

  finishSale(): Observable<FinishSaleResponse> {
    return this.http
      .post<FinishSaleResponse>(`${environment.apiUrl}/system-state/finish`, null)
      .pipe(tap(() => this.getState().subscribe()));
  }

  reset(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/system-state/reset`, null)
      .pipe(tap(() => this.getState().subscribe()));
  }

getWinners(): Observable<WinnerDto[]> {
  return this.http.get<RaffleReportDto[]>(`https://localhost:7259/api/system-state/winners`);
}
}