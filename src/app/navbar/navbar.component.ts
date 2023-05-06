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
      { label: 'Visualisierung', url: '', icon: 'pi pi-fw pi-chart-bar' },
      { label: 'Daten', url: '/daten', icon: 'pi pi-fw pi-database' },
      { label: 'About', url: '/about', icon: 'pi pi-fw pi-info-circle' },
      /*      {
        label: 'Dokumentation',
        url: '/dokumentation',
        icon: 'pi pi-fw pi-file',
      },*/
    ];

    this.activeItem = this.items[0] ?? null;
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
