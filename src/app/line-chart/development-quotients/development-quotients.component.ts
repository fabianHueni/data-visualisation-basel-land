import { Component, Input } from '@angular/core';
import { PopulationService } from '../../common/service/population.service';
import { LineChartData, LineChartKey } from '../line-chart-data-interface';

@Component({
  selector: 'app-development-quotients',
  templateUrl: './development-quotients.component.html',
  styleUrls: ['./development-quotients.component.scss'],
})
export class DevelopmentQuotientsComponent {
  @Input()
  set selectedMunicipalityId(municipalityId: number) {
    this.data = new Map<LineChartKey, LineChartData[]>();
    this.populationService
      .getYouthQuotientAgePerYearByMunicipality(municipalityId)
      .then((youthMap) => {
        this.data.set(
          {
            key: 'youth',
            label: 'Jugendquotient',
            color: '#006600',
          },
          youthMap
        );
      });

    this.populationService
      .getSeniorQuotientAgePerYearByMunicipality(municipalityId)
      .then((seniorMap) => {
        this.data.set(
          {
            key: 'senior',
            label: 'Altersquotient',
            color: '#000000',
          },
          seniorMap
        );
      });

    this.populationService
      .getFullQuotientAgePerYearByMunicipality(municipalityId)
      .then((fullMap) => {
        this.data.set(
          {
            key: 'full',
            label: 'Gesamtquotient',
            color: '#496f9e',
          },
          fullMap
        );
      });
  }

  public data: Map<LineChartKey, LineChartData[]> = new Map();

  constructor(private populationService: PopulationService) {}
}
