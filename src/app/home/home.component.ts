import { Component, OnInit } from '@angular/core';
import { PopulationService } from '../common/service/population.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private populationService: PopulationService) {}
  public populationData =
    this.populationService.getAgeMedianPerMunicipalityByYear(2022);

  /**
   * An array with all years from 2003 to 2022.
   * These are the years we have data to display.
   */
  public years = Array.from(
    { length: 2022 - 2003 + 1 },
    (value, index) => 2022 - index
  );

  public set selectedYear(year: number) {
    this._selectedYear = year;
    this.populationData =
      this.populationService.getAgeMedianPerMunicipalityByYear(
        this._selectedYear
      );
  }
  public get selectedYear() {
    return this._selectedYear;
  }

  private _selectedYear = 2022;

  ngOnInit() {
    this.years;
  }
}
