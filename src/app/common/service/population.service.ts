import { Injectable } from '@angular/core';
import { dsv, InternMap, median, rollup } from 'd3';
import { Population } from '../model/population.interface';

@Injectable({
  providedIn: 'root',
})
export class PopulationService {
  private readonly URL = 'assets/data/bevoelkerung_nach_gemeinde_edited.csv';
  private populationData: Population[] = [];

  constructor() {
    this.loadPopulationData();
  }

  /**
   * Returns the age median for all municipalities by a given year.
   *
   * TODO: Does not really return the right median. By now this is only a function to simulate a data object.
   *
   * @param year The year to calculate the medians
   */
  getAgeMedianPerMunicipalityByYear(year: number): InternMap {
    return rollup(
      this.populationData.filter((entry: Population) => entry.year == year),
      (v) => median(v, (d: Population) => d.population),
      (d) => d.year,
      (d) => d.municipality
    );
  }

  /**
   * Initialize the population data.
   */
  initializeData(): Promise<Population[]> {
    return this.loadPopulationData();
  }

  /**
   * Load the population data form the csv file and map the response to the {@link Population} data structure.
   * @private
   */
  private async loadPopulationData(): Promise<Population[]> {
    return dsv(';', this.URL).then(
      (value) =>
        (this.populationData = value.map(
          (v) =>
            ({
              year: parseInt(<string>v['jahr']),
              municipality_number: parseInt(<string>v['gemeinde_nummer']),
              municipality: v['gemeinde'],
              age: parseInt(<string>v['altersjahr_100_plus']),
              population: parseInt(<string>v['anzahl_personen']),
            } as Population)
        ))
    );
  }
}
