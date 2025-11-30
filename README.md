# ProyectoColaborativoCalculo1

## Overview
This is an **Angular 21** web application that visualizes geographic data using **OpenLayers**. It displays two interactive maps side‑by‑side:
- **USA map** (states and provinces) loaded from `ne_110m_admin_1_states_provinces_lakes.json`.
- **Argentina map** loaded from `Argentina.json`.

Both maps share the same tooltip component and support:
- **Hover highlighting** – the polygon under the cursor is filled with a semi‑transparent yellow.
- **Click selection** – clicking a region stores its name, country, identifier (ISO code or region), and population (`pop_2024`).
- **Population aggregation** – the total population of all selected regions is shown in the UI.

The project also includes a clean CSS‑based design (no Tailwind) and a simple routing setup that loads the `Documentos` view as the default page.

---

## Prerequisites
- **Node.js** (>= 20.x) and **npm** (>= 10.x)
- **Angular CLI** (`npm i -g @angular/cli@21`)
- A modern browser (Chrome, Firefox, Edge) with JavaScript enabled.

---

## Installation
```bash
# Clone the repository (if you haven't already)
git clone <repo‑url>
cd proyecto-colaborativo-calculo1

# Install dependencies
npm install
```

---

## Development Server
```bash
ng serve
```
Open your browser and navigate to `http://localhost:4200/`. The app will reload automatically when you modify source files.

---

## Project Structure (relevant parts)
```
src/
├─ app/
│  ├─ components/
│  │  └─ dashboard/
│  │     └─ views/
│  │        └─ documentos/
│  │           ├─ documentos.ts   # Map logic, hover, click, NgZone handling
│  │           ├─ documentos.html # UI for map, tooltip, selected regions list
│  │           └─ documentos.css  # Styling for map container & tooltip
│  └─ app-routing.module.ts       # Routes – default path loads DocumentosComponent
└─ assets/
   ├─ ne_110m_admin_1_states_provinces_lakes.json
   └─ Argentina.json
```

---

## Map Features
### Hover Highlight
- Implemented with an `OpenLayers` `pointermove` listener.
- The hovered feature receives a `Style` with a yellow fill (`rgba(255,255,0,0.6)`).
- The style is cleared when the cursor leaves the feature.

### Tooltip
- An `Overlay` displays the region name, identifier (region or ISO code), and population.
- Works for both USA and Argentina layers.

### Click Selection & Population Sum
- Click events are wrapped in `NgZone.run()` so Angular change detection updates the UI.
- Selected region data is stored in `selectedRegions` (array of objects).
- `totalPopulation` is a running sum displayed in the view.

---

## Styling
The UI uses **vanilla CSS** defined in `documentos.css`. Key classes:
- `.map` – full‑width/height container for the OpenLayers map.
- `.tooltip` – positioned overlay with a white background, rounded corners, and a subtle shadow.
- `.selected-list` – simple list styling for the selected regions panel.

Feel free to extend the design with your own color palette or add a dark‑mode toggle.

---

## Routing
`app-routing.module.ts` defines a single route:
```typescript
const routes: Routes = [
  { path: '', component: DocumentosComponent },
  // add more routes here as the project grows
];
```
The default route loads the map view directly.

---

## Building for Production
```bash
ng build --configuration production
```
The compiled files are placed in the `dist/` folder and can be served by any static web server.

---

## Further Development
- Add additional GeoJSON layers (e.g., Europe, Asia).
- Implement a side panel with charts that react to the selected regions.
- Introduce a service (`PopulationService`) to centralise aggregation logic and make it reusable across components.

---

## License
This project is provided under the MIT License.
