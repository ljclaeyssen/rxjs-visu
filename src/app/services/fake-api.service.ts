import { Injectable } from '@angular/core';
import { Observable, of, throwError, interval, timer } from 'rxjs';
import { delay, map, take, mergeMap } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  requestId: string;
}

@Injectable({ providedIn: 'root' })
export class FakeApiService {
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * Simule un appel GET avec délai configurable
   * Utile pour: switchMap, mergeMap, concatMap, exhaustMap
   */
  get<T>(data: T, delayMs = 1000): Observable<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    return of({
      data,
      timestamp: Date.now(),
      requestId,
    }).pipe(delay(delayMs));
  }

  /**
   * Simule une requête qui peut échouer aléatoirement
   * Utile pour: retry, retryWhen, catchError
   */
  getWithError<T>(data: T, errorRate = 0.5, delayMs = 1000): Observable<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    return timer(delayMs).pipe(
      mergeMap(() => {
        if (Math.random() < errorRate) {
          return throwError(() => new Error(`Request ${requestId} failed`));
        }
        return of({
          data,
          timestamp: Date.now(),
          requestId,
        });
      })
    );
  }

  /**
   * Simule un flux de données émis à intervalles réguliers
   * Utile pour: takeUntil, take, takeWhile, filter, scan
   */
  getStream<T>(items: T[], intervalMs = 500): Observable<ApiResponse<T>> {
    return interval(intervalMs).pipe(
      take(items.length),
      map((index) => ({
        data: items[index],
        timestamp: Date.now(),
        requestId: this.generateRequestId(),
      }))
    );
  }

  /**
   * Simule une recherche avec délai variable selon la complexité
   * Utile pour: debounceTime, distinctUntilChanged, switchMap
   */
  search<T>(query: string, results: T[], delayMs?: number): Observable<ApiResponse<T[]>> {
    const computedDelay = delayMs ?? Math.random() * 1000 + 500;
    const requestId = this.generateRequestId();

    return of({
      data: results,
      timestamp: Date.now(),
      requestId,
    }).pipe(delay(computedDelay));
  }

  /**
   * Simule un appel qui émet plusieurs valeurs progressivement
   * Utile pour: bufferTime, bufferCount, scan, reduce
   */
  getProgressiveData<T>(items: T[], batchSize = 1, intervalMs = 300): Observable<ApiResponse<T[]>> {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return interval(intervalMs).pipe(
      take(batches.length),
      map((index) => ({
        data: batches[index],
        timestamp: Date.now(),
        requestId: this.generateRequestId(),
      }))
    );
  }
}
