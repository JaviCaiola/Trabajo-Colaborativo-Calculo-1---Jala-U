import { Component, inject } from '@angular/core';
import { DashboardNavigation } from '../../../services/dashboard-navigation';
import { Inicio } from '../views/inicio/inicio';
import { Integrantes } from '../views/integrantes/integrantes';
import { Historial } from '../views/historial/historial';
import { Marcadores } from '../views/marcadores/marcadores';
import { Documentos } from '../views/documentos/documentos';
import { Configuracion } from '../views/configuracion/configuracion';
import { ExampleD3Component } from '../../../example-d3/example-d3.component';


@Component({
  selector: 'app-dashboard',
  imports: [
      Inicio,
      Integrantes,
      Historial,
      Marcadores,
      Documentos,
      ExampleD3Component
    ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  navService = inject(DashboardNavigation);

  handleAction(): void {
    console.log('Nueva acción ejecutada');
    // Aquí puedes agregar tu lógica
  }

}
