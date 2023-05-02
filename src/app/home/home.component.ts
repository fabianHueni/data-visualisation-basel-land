import { Component, OnInit } from '@angular/core';
import { PopulationService } from '../common/service/population.service';
import { interpolateOranges } from 'd3-scale-chromatic';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private populationService: PopulationService) {}
  public populationData =
    this.populationService.getAgeMedianPerMunicipalityByYear(2022);

  public changingValue: Subject<boolean> = new Subject();

  /**
   * An array with all years from 2003 to 2022.
   * These are the years we have data to display.
   */
  public years = Array.from(
    { length: 2022 - 2003 + 1 },
    (value, index) => 2022 - index
  );

  /**
   * An array with all data-selection-buttons to show.
   */
  public datasets = [
    {
      label: 'Medianalter',
      value: 'median',
      data: (year: number) =>
        this.populationService.getAgeMedianPerMunicipalityByYear(year),
    },
    {
      label: 'Kinder pro Einwohner',
      value: 'children',
      data: (year: number) =>
        this.populationService.getChildrenPerMunicipalityByYear(year),
    },
    {
      label: 'Senioren pro Einwohner',
      value: 'seniors',
      data: (year: number) =>
        this.populationService.getSeniorsPerMunicipalityByYear(year),
    },
  ];

  public set selectedDataset(dataset: any) {
    this._selectedDataSet = dataset;
    this.updateData();
  }

  public get selectedDataset() {
    return this._selectedDataSet;
  }

  public set selectedYear(year: number) {
    this._selectedYear = year;
    this.updateData();
  }
  public get selectedYear() {
    return this._selectedYear;
  }
  private _selectedYear = 2022;
  private _selectedDataSet = this.datasets[0];

  /**
   * Extract the median age from the population data for a corresponding shape data.
   * Therefore, map the `gemeinde_id_bfs` from the geo-json to a municipality from the population data
   *
   * @param d The shape data from the geo-json
   * @private
   */
  public getDataByShape(d: any): any {
    return this.populationData.get(d?.properties.gemeinde_id_bfs);
  }

  public getColorScheme = (data: any) => {
    switch (this._selectedDataSet?.value) {
      case 'median':
        return interpolateOranges((1 / 20) * (this.getDataByShape(data) - 35));
      case 'seniors':
        return interpolateOranges(
          this.getDataByShape(data)?.percentageAgeGroup * 3
        );
      case 'children':
        return interpolateOranges(
          this.getDataByShape(data)?.percentageAgeGroup * 3
        );
      default:
        return '';
    }
  };

  private updateData() {
    this.populationData = this._selectedDataSet.data(this._selectedYear);
    this.changingValue.next(true);
  }
}
