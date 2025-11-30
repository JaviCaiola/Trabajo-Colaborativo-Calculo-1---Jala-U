# ProyectoColaborativoCálculo1
## Descripción general
Esta es una aplicación web en **Angular 21** que visualiza datos geográficos utilizando **OpenLayers**. Muestra dos mapas interactivos lado a lado:
- **Mapa de EE.UU.** (estados y provincias) cargado desde `ne_110m_admin_1_states_provinces_lakes.json`.
- **Mapa de Argentina** cargado desde `Argentina.json`.

Ambos mapas comparten el mismo componente de *tooltip* y admiten:
- **Resaltado al pasar el cursor**: el polígono bajo el cursor se rellena con un amarillo semitransparente.
- **Selección por clic**: al hacer clic en una región, se guarda su nombre, país, identificador (código ISO o región) y población (`pop_2024`).
- **Agregación de población**: la población total de todas las regiones seleccionadas se muestra en la interfaz.

El proyecto también incluye un diseño limpio basado en **CSS** (sin Tailwind) y una configuración simple de enrutamiento que carga la vista `Documentos` como página predeterminada.

---
## Requisitos previos
- **Node.js** (>= 20.x) y **npm** (>= 10.x).
- **Angular CLI** (`npm i -g @angular/cli@21`).
- Un navegador moderno (Chrome, Firefox, Edge) con JavaScript habilitado.

---
## Instalación
```bash
# Clonar el repositorio (si aún no lo has hecho)
git clone <url-del-repositorio>
cd proyecto-colaborativo-calculo1

# Instalar dependencias
npm install
```

---
## Servidor de desarrollo
```bash
ng serve
```
Abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al modificar los archivos fuente.

---
## Estructura del proyecto (partes relevantes)
```
src/
├─ app/
│  ├─ components/
│  │  └─ dashboard/
│  │     └─ views/
│  │        └─ documentos/
│  │           ├─ documentos.ts   # Lógica de los mapas, resaltado, clics, manejo de NgZone
│  │           ├─ documentos.html # Interfaz para el mapa, tooltip y lista de regiones seleccionadas
│  │           └─ documentos.css  # Estilos para el contenedor del mapa y el tooltip
│  └─ app-routing.module.ts       # Rutas: la ruta predeterminada carga DocumentosComponent
└─ assets/
   ├─ ne_110m_admin_1_states_provinces_lakes.json
   └─ Argentina.json
```

---
## Funcionalidades de los mapas
### Resaltado al pasar el cursor
- Implementado con un listener `pointermove` de **OpenLayers**.
- La característica (*feature*) sobre la que se pasa el cursor recibe un `Style` con relleno amarillo (`rgba(255,255,0,0.6)`).
- El estilo se elimina cuando el cursor sale de la característica.

### Tooltip
- Un `Overlay` muestra el nombre de la región, identificador (región o código ISO) y población.
- Funciona para las capas de EE.UU. y Argentina.

### Selección por clic y suma de población
- Los eventos de clic se envuelven en `NgZone.run()` para que la detección de cambios de Angular actualice la interfaz.
- Los datos de la región seleccionada se guardan en `selectedRegions` (arreglo de objetos).
- `totalPopulation` es una suma acumulativa que se muestra en la vista.

---
## Estilos
La interfaz utiliza **CSS puro** definido en `documentos.css`. Clases clave:
- `.map`: contenedor de ancho/alto completo para el mapa de OpenLayers.
- `.tooltip`: capa superpuesta con fondo blanco, bordes redondeados y sombra sutil.
- `.selected-list`: estilo simple para el panel de regiones seleccionadas.

Si lo deseas, puedes extender el diseño con tu propia paleta de colores o agregar un modo oscuro.

---
## Enrutamiento
`app-routing.module.ts` define una única ruta:
```typescript
const routes: Routes = [
  { path: '', component: DocumentosComponent },
  // Agrega más rutas aquí a medida que el proyecto crezca
];
```
La ruta predeterminada carga directamente la vista del mapa.

---
## Compilación para producción
```bash
ng build --configuration production
```
Los archivos compilados se guardan en la carpeta `dist/` y pueden ser servidos por cualquier servidor web estático.

---
## Desarrollo futuro
- Agregar capas GeoJSON adicionales (ej: Europa, Asia).
- Implementar un panel lateral con gráficos que reaccionen a las regiones seleccionadas.
- Introducir un servicio (`PopulationService`) para centralizar la lógica de agregación y hacerlo reutilizable en otros componentes.

---
## Licencia
Este proyecto se proporciona bajo la **Licencia MIT**.
