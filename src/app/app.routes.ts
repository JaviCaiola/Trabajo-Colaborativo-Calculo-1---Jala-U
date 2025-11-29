import { Routes } from '@angular/router';

import { ExampleD3Component } from './example-d3/example-d3.component';

export const routes: Routes = [
    { path: '', redirectTo: 'example-d3', pathMatch: 'full' },
    { path: 'example-d3', component: ExampleD3Component }
];
