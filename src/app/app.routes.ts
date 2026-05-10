import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Dashboard },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/history/history').then((m) => m.History)
  }
];
