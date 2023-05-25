import { Component, Input } from '@angular/core';
import { PopulationService } from '../../common/service/population.service';
import { LineChartData, LineChartKey } from '../line-chart-data-interface';

@Component({
  selector: 'app-development-median',
  templateUrl: './development-median.component.html',
  styleUrls: ['./development-median.component.scss'],
})
export class DevelopmentMedianComponent {
  @Input()
  set selectedMunicipalityId(municipalityId: number) {
    this.data = new Map<LineChartKey, LineChartData[]>();

    this.populationService
      .getMedianAgePerYearByMunicipality(municipalityId)
      .then((medianMap) => {
        const medians = Array.from(
          medianMap as unknown as Map<number, number>,
          (d) => {
            return { year: d[0], value: d[1] };
          }
        );
        medians.sort((a: any, b: any) => a.year - b.year);

        this.data.set(
          {
            key: 'median',
            label: 'Medianalter',
            color: '#496f9e',
          },
          medians
        );
      });
  }

  public data: Map<LineChartKey, LineChartData[]> = new Map();

  constructor(private populationService: PopulationService) {}
}
