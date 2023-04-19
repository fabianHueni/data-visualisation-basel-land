import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  items: MenuItem[];

  activeItem: MenuItem;

  constructor() {
    this.items = [
      { label: 'Visualisierung', icon: 'pi pi-fw pi-chart-bar' },
      { label: 'Daten', icon: 'pi pi-fw pi-database' },
      { label: 'About', icon: 'pi pi-fw pi-info-circle' },
      { label: 'Dokumentation', icon: 'pi pi-fw pi-file' },
    ];

    this.activeItem = this.items[0] ?? null;
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
