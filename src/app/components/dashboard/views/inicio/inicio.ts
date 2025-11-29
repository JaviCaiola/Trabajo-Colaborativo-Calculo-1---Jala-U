import { Component, AfterViewInit, ElementRef, ViewChild, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';


// Definición de tipos de datos para asegurar el tipado correcto del GeoJSON
interface StateProperties {
  postal: string;
  name: string;
  pop_2024: number;
  region?: string;
}

interface GeoJsonFeature extends GeoJSON.Feature<GeoJSON.Geometry, StateProperties> { }
interface GeoJsonCollection extends GeoJSON.FeatureCollection<GeoJSON.Geometry, StateProperties> { }


@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio implements AfterViewInit {

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<SVGSVGElement>;

  // --- SEÑALES DE ESTADO ---
  // 1. Datos del GeoJSON (inicialmente null, se cargará en ngAfterViewInit)
  geoJsonData = signal<GeoJsonCollection | null>(null);

  // 2. Estado actualmente seleccionado por el usuario
  selectedState = signal<StateProperties | null>(null);

  // --- SEÑALES COMPUTADAS (D3 Logic) ---

  // Calcula la población mínima y máxima para la escala de color
  maxPopulation = computed(() => {
    const data = this.geoJsonData();
    if (!data) return 0;
    return d3.max(data.features, d => d.properties.pop_2024) || 1;
  });

  minPopulation = computed(() => {
    const data = this.geoJsonData();
    if (!data) return 0;
    return d3.min(data.features, d => d.properties.pop_2024) || 0;
  });

  // Crea la escala de color, usando el interpolador 'YlOrRd' (Amarillo-Naranja-Rojo)
  colorScale = computed(() =>
    d3.scaleSequential([this.minPopulation(), this.maxPopulation()], d3.interpolatePlasma)
  );

  // Estilo CSS para el gradiente de la leyenda (se usa en el template)
  gradientStyle = computed(() => {
    const minVal = this.minPopulation();
    const maxVal = this.maxPopulation();
    const scale = this.colorScale();

    // Genera colores para la leyenda de 0% a 100%
    const stops = d3.range(0, 1.01, 0.1).map(t => scale(minVal + (maxVal - minVal) * t));
    return `linear-gradient(to right, ${stops.join(', ')})`;
  });

  // --- LÓGICA DEL COMPONENTE ---

  // Formato de números para la UI
  formatPopulation(n: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(n);
  }

  // Carga los datos y dibuja el mapa después de que la vista se haya inicializado
  ngAfterViewInit(): void {
    // 1. Cargar el JSON real
    d3.json<GeoJsonCollection>('ne_110m_admin_1_states_provinces_lakes.json').then(data => {
      if (data) {
        console.log('Número de estados:', data.features.length);
        this.geoJsonData.set(data);
        this.drawMap();
      } else {
        console.error("No se pudieron cargar los datos del mapa.");
      }
    }).catch(err => {
      console.error("Error al cargar el JSON:", err);
    });


  }

  // Dibuja el mapa coropleta usando D3.js
  drawMap(): void {
      const data = this.geoJsonData();
      if (!data || !this.mapContainer) return;

      const element = this.mapContainer.nativeElement;
      // Aseguramos dimensiones mínimas por si el contenedor aún no tiene tamaño
      const width = element.clientWidth || 800;
      const height = element.clientHeight || 500;

      const svg = d3.select(element)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      svg.selectAll('*').remove();

      // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---

      // 1. Usamos geoAlbersUsa, pero dejamos que D3 calcule la escala
      const projection = d3.geoAlbersUsa()
        .fitSize([width, height], data as any); // <--- ESTO ES MAGIA

    console.log(data);
      // ---------------------------------

      const path = d3.geoPath().projection(projection);
      const colorScaleFn = this.colorScale();

      // Dibujamos
      svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        // Forzamos el tipado a any para evitar conflictos de TypeScript con d3
        .attr("d", (d: any) => path(d) as string)
        .attr("class", "state")
        // Añadimos un borde visible por si el color falla
        .attr("stroke", "#fff")
        .attr("stroke-width", "1px")
        .attr("fill", d => {
          const pop = d.properties.pop_2024;
          // Si no hay población, rellena de gris para ver si se dibuja
          return pop ? colorScaleFn(pop) : '#cccccc';
        })
        .on("click", (event, d) => this.handleStateClick(event, d as GeoJsonFeature))
        .append("title")
        .text(d => `${d.properties.name}: ${this.formatPopulation(d.properties.pop_2024)}`);
    }

  // --- MANEJO DE INTERACCIÓN ---
  handleStateClick(event: MouseEvent, d: GeoJsonFeature): void {
    this.selectedState.set(d.properties);

    d3.selectAll('.state')
      .classed('ring-2 ring-offset-2 ring-blue-900', false);

    d3.select(event.currentTarget as Element)
      .classed('ring-2 ring-offset-2 ring-blue-500', true);
  }



  // Maneja el redimensionamiento de la ventana para hacer el mapa responsive
  onResize = () => {
    // Re-dibuja el mapa para ajustar la proyección
    this.drawMap();
  };

  // Adjunta el listener de redimensionamiento
  constructor() {
    // Inicializa la escucha de eventos de redimensionamiento
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }

}
