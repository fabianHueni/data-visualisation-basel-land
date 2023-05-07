import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewRef,
} from '@angular/core';
import { PopulationService } from '../common/service/population.service';
import { interpolateOranges } from 'd3-scale-chromatic';
import { Subject } from 'rxjs';
import {
  interpolateBlues,
  interpolateCool,
  interpolateGreens,
  scaleLinear,
  select,
} from 'd3';
import { Dataset } from '../common/model/dataset.interface';

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

  @ViewChild('medianTooltip') tooltipMedian?: TemplateRef<any>;
  @ViewChild('seniorsTooltip') tooltipSenior?: TemplateRef<any>;
  @ViewChild('ageBucketTooltip') tooltipAgeBucket?: TemplateRef<any>;

  /**
   * An array with all years from 2003 to 2022.
   * These are the years we have data to display.
   */
  public years = Array.from(
    { length: 2022 - 2003 + 1 },
    (value, index) => 2022 - index
  );

  /**
   * An array with all years from 2003 to 2022.
   * These are the years we have data to display.
   */
  public sex = [
    { label: 'Alle', value: 0 },
    { label: 'Männer', value: 1 },
    { label: 'Frauen', value: 2 },
  ];

  /**
   * An array with all datasets to show.
   */
  public datasets: Dataset[] = [
    {
      label: 'Medianalter',
      value: 'median',
      data: (year: number) =>
        this.populationService.getAgeMedianPerMunicipalityByYear(
          year,
          this.selectedSex
        ),
      color: (data: any) => {
        return this.selectedDataset.colorScheme(
          (1 / 20) * (this.getDataByShape(data) - 35)
        );
      },
      colorScheme: interpolateBlues,
      tooltipRef: () => this.tooltipMedian,
      legendTitle: 'Medianalter in Jahren',
      min: 35,
      max: 55,
    },
    {
      label: 'Altersklassen pro Einwohner',
      value: 'age-buckets',
      data: (year: number) =>
        this.populationService.getAgeGroupPerMunicipalityByYear(
          year,
          this.minAge,
          this.maxAge,
          this.selectedSex
        ),
      color: (data: any) => {
        return this.selectedDataset.colorScheme(
          this.getDataByShape(data)?.percentageAgeGroup
        );
      },
      colorScheme: interpolateBlues,
      tooltipRef: () => this.tooltipAgeBucket,
      legendTitle: 'Anteil der Altersklasse in Prozent',
      min: 0,
      max: 100,
    },
    {
      label: 'Betagte',
      value: 'seniors',
      data: (year: number) =>
        this.populationService.getAgeGroupPerMunicipalityByYear(
          year,
          65,
          200,
          this.selectedSex
        ),
      color: (data: any) => {
        return this.selectedDataset.colorScheme(
          (this.getDataByShape(data)?.percentageAgeGroup - 0.05) * 4 // shift by 5% and stretch with 4
        );
      },
      colorScheme: interpolateBlues,
      tooltipRef: () => this.tooltipSenior,
      legendTitle: 'Anteil der Betagten in Prozent',
      min: 0,
      max: 30,
    },
    {
      label: 'Hochbetagte',
      value: 'seniors',
      data: (year: number) =>
        this.populationService.getAgeGroupPerMunicipalityByYear(year, 80, 200),
      color: (data: any) => {
        return interpolateBlues(
          this.getDataByShape(data)?.percentageAgeGroup * 8
        );
      },
      colorScheme: interpolateBlues,
      tooltipRef: () => this.tooltipSenior,
      legendTitle: 'Anteil der Hochbetagten in Prozent',
      min: 0,
      max: 10,
    },
  ];

  public set minAge(age: any) {
    this._minAge = age;
    this.updateData();
  }

  public get minAge() {
    return this._minAge;
  }

  public set maxAge(age: any) {
    this._maxAge = age;
    this.updateData();
  }

  public get maxAge() {
    return this._maxAge;
  }

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

  public set selectedSex(sex: number) {
    this._selectedSex = sex;
    this.updateData();
  }
  public get selectedSex() {
    return this._selectedSex;
  }

  private _maxAge = 100;
  private _minAge = 0;
  private _selectedYear = 2022;

  /**
   *  0 - All (Default)
   *  1 - Male
   *  2 - Female
   *
   * @private
   */
  private _selectedSex = 0;
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
    return this._selectedDataSet.color(data);
  };

  private updateData() {
    this.populationData = this._selectedDataSet.data(this._selectedYear);
    this.changingValue.next(true);
  }
}
