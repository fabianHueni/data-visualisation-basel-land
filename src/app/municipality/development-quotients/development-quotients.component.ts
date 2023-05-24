import { Component, Input } from '@angular/core';
import { PopulationService } from '../../common/service/population.service';
import {
  LineChartData,
  LineChartKey,
} from '../../line-chart/line-chart-data-interface';

@Component({
  selector: 'app-development-quotients',
  templateUrl: './development-quotients.component.html',
  styleUrls: ['./development-quotients.component.scss'],
})
export class DevelopmentQuotientsComponent {
  @Input()
  set selectedMunicipalityId(municipalityId: number) {
    this.data = new Map<LineChartKey, LineChartData[]>();

    const medianMap =
      this.populationService.getMedianAgePerYearByMunicipality(municipalityId);

    this.medians = Array.from(
      medianMap as unknown as Map<number, number>,
      (d) => {
        return { year: d[0], value: d[1] };
      }
    );
    this.medians.sort((a: any, b: any) => a.year - b.year);

    this.data.set(
      {
        key: 'youth',
        label: 'Jugendquotient',
        color: '#006600',
      },
      this.populationService.getYouthQuotientAgePerYearByMunicipality(
        municipalityId
      )
    );

    this.data.set(
      {
        key: 'senior',
        label: 'Altersquotient',
        color: '#000000',
      },
      this.populationService.getSeniorQuotientAgePerYearByMunicipality(
        municipalityId
      )
    );
    this.data.set(
      {
        key: 'full',
        label: 'Gesamtquotient',
        color: '#496f9e',
      },
      this.populationService.getFullQuotientAgePerYearByMunicipality(
        municipalityId
      )
    );
  }

  public data: Map<LineChartKey, LineChartData[]> = new Map();

  public medians: any;

  constructor(private populationService: PopulationService) {}
}
