import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Municipality } from '../common/model/population.interface';
import { PopulationService } from '../common/service/population.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  public items: MenuItem[];

  public activeItem: MenuItem;

  public mobileMenuVisible = false;

  constructor() {
    this.items = [
      { label: 'Kanton', url: '', icon: 'pi pi-fw pi-chart-bar' },
      {
        label: 'Gemeinden',
        url: '/gemeinde/2829', // Liestal is default
        icon: 'pi pi-fw pi-chart-bar',
      },
      { label: 'Daten', url: '/daten', icon: 'pi pi-fw pi-database' },
      { label: 'About', url: '/about', icon: 'pi pi-fw pi-info-circle' },
    ];

    this.activeItem = this.items[0] ?? null;
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  showMobileMenu() {
    this.mobileMenuVisible = true;
  }

  closeMobileMenu() {
    this.mobileMenuVisible = false;
  }
}
