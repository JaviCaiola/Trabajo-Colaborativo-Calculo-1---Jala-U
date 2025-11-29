import { Injectable, signal, effect, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface MenuOption {
  id: string;
  label: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardNavigation {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly menuOptions: MenuOption[] = [
    { id: 'inicio', label: 'Inicio', icon: 'bi-house' },
    { id: 'integrantes', label: 'Integrantes', icon: 'bi-people' },
    { id: 'historial', label: 'Historial', icon: 'bi-clock-history' },
    { id: 'marcadores', label: 'Marcadores', icon: 'bi-star' },
    { id: 'documentos', label: 'Documentos', icon: 'bi-file-text' },
    { id: 'example-d3', label: 'Configuración', icon: 'bi-gear' }
  ];

  selectedOption = signal<string>(this.getInitialOption());
  options = signal<MenuOption[]>(this.menuOptions);

  constructor() {
    // Solo sincronizar si estamos en navegador
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        sessionStorage.setItem('dashboard-selected', this.selectedOption());
      });
    }
  }

  private getInitialOption(): string {
    if (isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem('dashboard-selected');
      return saved || 'inicio';
    }
    return 'inicio'; // valor por defecto en SSR
  }

  selectOption(optionId: string): void {
    this.selectedOption.set(optionId);
  }

  isSelected(optionId: string): boolean {
    return this.selectedOption() === optionId;
  }

  updateMenuOptions(newOptions: MenuOption[]): void {
    this.options.set(newOptions);
  }
}
