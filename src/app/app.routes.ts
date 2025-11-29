import { Routes } from '@angular/router';

import { ExampleD3Component } from './example-d3/example-d3.component';
import { Dashboard } from './components/dashboard/dashboard/dashboard';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: Dashboard },
    { path: 'example-d3', component: ExampleD3Component }
];
