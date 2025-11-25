import { ChangeDetectorRef, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { switchMap, mergeMap, concatMap, exhaustMap, finalize, tap } from 'rxjs/operators';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { FakeApiService } from '../../services/fake-api.service';

export type OperatorType = 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap';

interface LogEntry {
  id: number;
  type: 'emit' | 'request-start' | 'request-end' | 'cancelled';
  requestId: string;
  timestamp: number;
  message: string;
}

@Component({
  selector: 'app-operator-demo',
  imports: [Button, Tag, DatePipe],
  templateUrl: './operator-demo.html',
  styleUrl: './operator-demo.css',
})
export class OperatorDemo {
  private api = inject(FakeApiService);
  private cdr = inject(ChangeDetectorRef);

  operator = input.required<OperatorType>();

  logs = signal<LogEntry[]>([]);
  activeRequests = signal<number>(0);
  private trigger$ = new Subject<number>();
  private subscription?: Subscription;
  private logId = 0;
  private emitCounter = 0;

  constructor() {
    effect(() => {
      const op = this.operator();
      this.subscription?.unsubscribe();
      this.setupOperator(op);
    });
  }

  private setupOperator(operatorType: OperatorType): void {
    this.subscription = this.trigger$
      .pipe(
        this.getOperator(operatorType),
      )
      .subscribe({
        next: (response) => {
          this.addLog('request-end', response.requestId, `Réponse reçue #${response.requestId}`);
          this.activeRequests.update((n) => Math.max(0, n - 1));
        },
        error: (err) => console.error(err),
      });
  }

  private getOperator(operatorType: OperatorType) {
    const apiCall = (emitId: number) => {
      const requestId = `${emitId}`;
      let completed = false;

      this.addLog('request-start', requestId, `Requête démarrée (emit #${emitId})`);
      this.activeRequests.update((n) => n + 1);

      return this.api.get({ emitId }, 2000).pipe(
        tap(() => {
          completed = true;
        }),
        finalize(() => {
          if (!completed) {
            this.addLog('cancelled', requestId, `Requête annulée (emit #${emitId})`);
            this.activeRequests.update((n) => Math.max(0, n - 1));
          }
        })
      );
    };

    switch (operatorType) {
      case 'switchMap':
        return switchMap((emitId: number) => apiCall(emitId));
      case 'mergeMap':
        return mergeMap((emitId: number) => apiCall(emitId));
      case 'concatMap':
        return concatMap((emitId: number) => apiCall(emitId));
      case 'exhaustMap':
        return exhaustMap((emitId: number) => apiCall(emitId));
    }
  }

  emitOnce(): void {
    this.emitCounter++;
    this.addLog('emit', `${this.emitCounter}`, `Émission #${this.emitCounter}`);
    this.trigger$.next(this.emitCounter);
  }

  emitFiveTimes(): void {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.emitOnce();
      }, i * 300);
    }
  }

  clear(): void {
    this.logs.set([]);
    this.emitCounter = 0;
    this.logId = 0;
  }

  private addLog(type: LogEntry['type'], requestId: string, message: string): void {
    this.logs.update((logs) => [
      ...logs,
      {
        id: ++this.logId,
        type,
        requestId,
        timestamp: Date.now(),
        message,
      },
    ]);
    this.cdr.markForCheck();
  }

  getTagSeverity(type: LogEntry['type']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case 'emit':
        return 'info';
      case 'request-start':
        return 'warn';
      case 'request-end':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
