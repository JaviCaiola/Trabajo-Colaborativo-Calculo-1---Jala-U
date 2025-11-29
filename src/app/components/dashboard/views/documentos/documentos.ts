import { Component, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import { Style, Fill, Stroke } from 'ol/style';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentos',
  imports: [CommonModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css',
  encapsulation: ViewEncapsulation.None,
})
export class Documentos implements AfterViewInit {
  map!: Map;
  @ViewChild('tooltip') tooltipElement!: ElementRef;
  tooltipOverlay!: Overlay;
  hoveredFeature: any = null;
  selectedRegions: any[] = [];
  totalPopulation: number = 0;

  highlightStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.6)',
    }),
    stroke: new Stroke({
      color: '#319FD3',
      width: 1,
    }),
  });

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.tooltipOverlay = new Overlay({
      element: this.tooltipElement.nativeElement,
      offset: [10, 0],
      positioning: 'bottom-left',
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: new VectorSource({
            url: '/ne_110m_admin_1_states_provinces_lakes.json',
            format: new GeoJSON(),
          }),
        }),
        new VectorLayer({
          source: new VectorSource({
            url: '/Argentina.json',
            format: new GeoJSON(),
          }),
        }),
      ],
      overlays: [this.tooltipOverlay],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    this.map.on('pointermove', (evt) => {
      if (this.hoveredFeature) {
        this.hoveredFeature.setStyle(undefined);
        this.hoveredFeature = null;
      }

      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      }) as Feature;

      if (feature) {
        this.hoveredFeature = feature;
        feature.setStyle(this.highlightStyle);

        const properties = feature.getProperties();
        const name = properties['name'] || properties['nombre'];
        const region = properties['region'] || properties['iso_id'];
        const pop2024 = properties['pop_2024'];

        this.tooltipElement.nativeElement.innerHTML = `
          <div class="font-bold">${name}</div>
          <div>Region: ${region}</div>
          <div>Poblacion: ${pop2024 ? pop2024.toLocaleString() : 'N/A'}</div>
        `;
        this.tooltipOverlay.setPosition(evt.coordinate);
        this.tooltipElement.nativeElement.style.display = 'block';
        this.map.getTargetElement().style.cursor = 'pointer';
      } else {
        this.tooltipElement.nativeElement.style.display = 'none';
        this.map.getTargetElement().style.cursor = '';
      }
    });

    this.map.on('click', (evt) => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      });

      if (feature) {
        const properties = feature.getProperties();
        console.log(properties);
        
        const name = properties['name'] || properties['nombre'];
        const identifier = properties['region'] || properties['iso_id'];
        const pop2024Raw = properties['pop_2024'];
        const country = properties['iso_id'] ? 'Argentina' : 'USA';

        // Convertir a número y validar
        const population = Number(pop2024Raw);
        
        if (!isNaN(population) && population > 0) {
          this.ngZone.run(() => {
            this.selectedRegions.push({
              name: name,
              country: country,
              identifier: identifier,
              population: population
            });

            this.totalPopulation += population;
            console.log('Población agregada:', population);
            console.log('Total actual:', this.totalPopulation);
            console.log('Regiones seleccionadas:', this.selectedRegions);
            
            // Forzar detección de cambios
            this.cdr.detectChanges();
          });
        } else {
          console.warn('Población no válida para', name, ':', pop2024Raw);
        }
      }
    });
  }
}
