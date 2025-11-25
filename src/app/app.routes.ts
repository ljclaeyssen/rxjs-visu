import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'main-operators',
    loadComponent: () => import('./pages/main-operators/main-operators').then((m) => m.MainOperators),
  },
  {
    path: '',
    redirectTo: 'main-operators',
    pathMatch: 'full',
  },
];
