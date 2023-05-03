import { Injectable } from '@angular/core';
import { dsv, InternMap, median, rollup } from 'd3';
import { Population, PopulationByGroups } from '../model/population.interface';

export const AGE_GROUPS: string[] = [
  '0-4',
  '5-9',
  '10-14',
  '15-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80-84',
  '85-89',
  '90-94',
  '95-99',
  '100+',
];

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

  private getPopulationDataPerMunicipality(id: number): Population[] {
    return this.populationData.filter((p) => {
      p.municipality_number === id;
    });
  }

  public getPopulationNumbersAgeGroupsPerMunicipality(id: number) {
    let pop = this.getPopulationDataPerMunicipality(id);
    let popByYearAndGroups = [];
    for (let i = 2003; i < 2023; i++) {
      let popByYear = pop.filter((p) => {
        p.year === i;
      });
      let popByGroups: PopulationByGroups[] = [];
      for (let g of AGE_GROUPS) {
        popByGroups.push({
          year: i,
          ageGroup: g,
          population: 0,
        });
      }
      for (let p of popByYear) {
        let index = Math.floor(p.age / 5);
        popByGroups[index].population += p.population;
      }
      popByYearAndGroups.push(popByGroups);
    }
  }
}
