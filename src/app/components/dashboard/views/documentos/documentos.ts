import { Component, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'app-documentos',
  imports: [],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css',
  encapsulation: ViewEncapsulation.None,
})
export class Documentos implements AfterViewInit {
  map!: Map;
  @ViewChild('tooltip') tooltipElement!: ElementRef;
  tooltipOverlay!: Overlay;

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
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      });

      if (feature) {
        const properties = feature.getProperties();
        const name = properties['name'] || properties['nombre'];
        const region = properties['region'] || properties['iso_id'];
        const pop2024 = properties['pop_2024'];

        this.tooltipElement.nativeElement.innerHTML = `
          <div class="font-bold">${name}</div>
          <div>Region: ${region}</div>
          <div>Poblacion: ${pop2024}</div>
        `;
        this.tooltipOverlay.setPosition(evt.coordinate);
        this.tooltipElement.nativeElement.style.display = 'block';
      } else {
        this.tooltipElement.nativeElement.style.display = 'none';
      }
    });
  }
}
