import { Component, TemplateRef, ViewChild } from '@angular/core';
import { PopulationService } from '../common/service/population.service';
import { Subject } from 'rxjs';
import { interpolateBlues, max, min } from 'd3';
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
   * Possible Selection Options for Sex
   */
  public sex = [
    { label: 'Alle', value: 0 },
    { label: 'Männer', value: 1 },
    { label: 'Frauen', value: 2 },
  ];

  public yearInterval = 0;

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
      description:
        'Das Medianalter ist das Alter, bei dem die Hälfte der Bevölkerung jünger und die andere Hälfte älter ist. ' +
        'Der Wert dient als Kennzahl für die Altersstruktur einer Bevölkerung.',
      min: 35,
      max: 55,
    },
    {
      label: 'Betagte',
      value: 'elderly',
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
      description: 'Als Betagte gelten alle Personen ab 65 Jahren.',
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
      description: 'Als Hochbetagte gelten alle Personen ab 80 Jahren.',
      min: 0,
      max: 10,
    },
    {
      label: 'Altersklassen',
      value: 'age-buckets',
      data: (year: number) => {
        const data = this.populationService.getAgeGroupPerMunicipalityByYear(
          year,
          this.minAge,
          this.maxAge,
          this.selectedSex
        );

        // Get all percentageAgeGroup values from the data to calculate the min and max value.
        // They are used to generate the color schema
        const values: number[] = [];
        data.forEach((d: any) => {
          values.push(d.percentageAgeGroup);
        });
        this.selectedDataset.min = min(values);
        this.selectedDataset.max = max(values);

        return data;
      },
      color: (data: any) => {
        return this.selectedDataset.colorScheme(
          (this.getDataByShape(data)?.percentageAgeGroup -
            this.selectedDataset.min * 0.95) /
            ((this.selectedDataset.max - this.selectedDataset.min) * 1.05)
        );
      },
      colorScheme: interpolateBlues,
      tooltipRef: () => this.tooltipAgeBucket,
      legendTitle: 'Anteil der Altersklasse in Prozent',
      description: 'Mit den obigen ',
      min: 0,
      max: 100,
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

  /**
   * Toggle the year interval to automatically increase the year.
   * If the interval is already set then pause and remove the intervall. Otherwise, set the interval with 1.0 seconds.
   */
  public toggleYearInterval() {
    if (this.yearInterval > 0) {
      clearInterval(this.yearInterval);
      this.yearInterval = 0;
    } else {
      this.yearInterval = setInterval(() => {
        this._selectedYear = this._selectedYear + 1;
        if (this._selectedYear > 2022) {
          this._selectedYear = 2003;
        }
        this.updateData();
      }, 1000);
    }
  }

  private updateData() {
    this.populationData = this._selectedDataSet.data(this._selectedYear);
    this.changingValue.next(true);
  }
}
