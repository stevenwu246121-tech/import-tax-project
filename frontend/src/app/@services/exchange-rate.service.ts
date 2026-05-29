import { Injectable } from '@angular/core';

import { Observable, map, shareReplay } from 'rxjs';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  private jpyToTwdRate$?: Observable<number>;

  constructor(private apiService: ApiService) {}

  getJpyToTwdRate(): Observable<number> {
    if (!this.jpyToTwdRate$) {
      this.jpyToTwdRate$ = this.apiService
        .getJpyExchangeRate()
        .pipe(shareReplay(1));
    }

    return this.jpyToTwdRate$;
  }

  getTwdToJpyRate(): Observable<number> {
    return this.getJpyToTwdRate().pipe(
      map((rate) => 1 / rate)
    );
  }

  refresh(): void {
    this.jpyToTwdRate$ = undefined;
  }
}
