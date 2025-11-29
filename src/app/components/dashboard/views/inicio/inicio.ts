import { Component, AfterViewInit, ElementRef, ViewChild, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

// Definición de tipos de datos para asegurar el tipado correcto del GeoJSON
interface StateProperties {
  postal: string;
  name: string;
  pop_2024: number; // El dato que unimos en Mapshaper
}

interface GeoJsonFeature extends GeoJSON.Feature<GeoJSON.Geometry, StateProperties> {}
interface GeoJsonCollection extends GeoJSON.FeatureCollection<GeoJSON.Geometry, StateProperties> {}


@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio implements AfterViewInit{

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
  // Opcional: d3.interpolateViridis, d3.interpolatePlasma
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

  // --- MOCK DE DATOS (REEMPLAZAR CON TU EXPORTACIÓN) ---
  // IMPORTANTE: Debes reemplazar este mock con los datos reales de tu archivo 'states_with_population_clean.geojson'.
  private geoJsonMock: GeoJsonCollection = {
    "type": "FeatureCollection",
    "features": [
      // Ejemplo: Estados de alta población
      { "type": "Feature", "properties": { "postal": "CA", "name": "California", "pop_2024": 39555674 }, "geometry": { "type": "Polygon", "coordinates": [[[-124, 33], [-117, 33], [-117, 42], [-124, 42], [-124, 33]]] } },
      { "type": "Feature", "properties": { "postal": "TX", "name": "Texas", "pop_2024": 30503301 }, "geometry": { "type": "Polygon", "coordinates": [[[-106, 26], [-93, 30], [-106, 36], [-106, 26]]] } },
      { "type": "Feature", "properties": { "postal": "FL", "name": "Florida", "pop_2024": 21538192 }, "geometry": { "type": "Polygon", "coordinates": [[[-87, 25], [-80, 25], [-80, 30], [-87, 30], [-87, 25]]] } },
      { "type": "Feature", "properties": { "postal": "NY", "name": "New York", "pop_2024": 20201249 }, "geometry": { "type": "Polygon", "coordinates": [[[-79, 40], [-71, 40], [-71, 45], [-79, 45], [-79, 40]]] } },
      // Ejemplo: Estados de baja población
      { "type": "Feature", "properties": { "postal": "WY", "name": "Wyoming", "pop_2024": 587618 }, "geometry": { "type": "Polygon", "coordinates": [[[-111, 41], [-104, 41], [-104, 45], [-111, 45], [-111, 41]]] } },
      { "type": "Feature", "properties": { "postal": "DC", "name": "District of Columbia", "pop_2024": 689545 }, "geometry": { "type": "Polygon", "coordinates": [[[-77.1, 38.8], [-76.9, 38.8], [-76.9, 39], [-77.1, 39], [-77.1, 38.8]]] } },
      // Agrega el resto de los 51 estados aquí...
    ]
  };

  // --- LÓGICA DEL COMPONENTE ---

  // Formato de números para la UI
  formatPopulation(n: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(n);
  }

  // Carga los datos y dibuja el mapa después de que la vista se haya inicializado
  ngAfterViewInit(): void {
    // 1. Cargar el mock (en un proyecto real, se cargaría un JSON usando d3.json)
    this.geoJsonData.set(this.geoJsonMock);

    // 2. Dibujar el mapa
    this.drawMap();
  }

  // Dibuja el mapa coropleta usando D3.js
  drawMap(): void {
    const data = this.geoJsonData();
    if (!data || !this.mapContainer) {
      console.error("GeoJSON data or map container not available.");
      return;
    }

    const element = this.mapContainer.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;

    // Selecciona el contenedor SVG y limpia cualquier dibujo anterior
    const svg = d3.select(element)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll('*').remove();

    // 1. Definición de Proyección (geoAlbersUsa es ideal para mapas de EE. UU.)
    const projection = d3.geoAlbersUsa()
      .scale(width * 1.3) // Ajusta la escala para que quepa bien
      .translate([width / 2, height / 2]);

    // 2. Definición de la Función de Ruta (Path Generator)
    const path = d3.geoPath().projection(projection);

    // 3. Obtener la escala de color
    const colorScaleFn = this.colorScale();

    // 4. Dibujar los estados (paths)
    svg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "state")
      .attr("fill", d => colorScaleFn(d.properties.pop_2024))
      .on("click", (event, d) => this.handleStateClick(event, d)) // <-- ahora pasas event y d
      .append("title")
      .text(d => `${d.properties.name}: ${this.formatPopulation(d.properties.pop_2024)}`);
 // Tooltip simple

    // 5. Centrar el mapa si el viewBox/aspect-ratio es dinámico
    // Nota: La proyección geoAlbersUsa ya está diseñada para centrar en EE. UU.
  }

  // --- MANEJO DE INTERACCIÓN ---
  handleStateClick(event: MouseEvent, d: GeoJsonFeature): void {
    this.selectedState.set(d.properties);

    // Quitar estilos de todos los estados
    d3.selectAll('.state')
      .classed('ring-2 ring-offset-2 ring-blue-500', false);

    // Aplicar estilo al estado clicado
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
