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
   * @param year The year to calculate the medians
   */
  getAgeMedianPerMunicipalityByYear(year: number): InternMap {
    return rollup(
      this.populationData.filter((entry: Population) => entry.year == year),
      (v) => this.calcMedian(v),
      (d) => d.municipality_number
    );
  }

  /**
   * Returns the percentage of seniors (>=65 years) for all municipalities by a given year.
   *
   * @param year The year to calculate the medians
   */
  getSeniorsPerMunicipalityByYear(year: number): InternMap {
    return rollup(
      this.populationData.filter((entry: Population) => entry.year == year),
      (v) => this.calcAgeBucketPercentageRate(v, 64, Number.MAX_VALUE),
      (d) => d.municipality_number
    );
  }

  /**
   * Returns the percentage of children (<18 years) for all municipalities by a given year.
   *
   * @param year The year to calculate the medians
   */
  getChildrenPerMunicipalityByYear(year: number): InternMap {
    return rollup(
      this.populationData.filter((entry: Population) => entry.year == year),
      (v) => this.calcAgeBucketPercentageRate(v, -1, 18),
      (d) => d.municipality_number
    );
  }

  /**
   * Returns the percentage of an age group for all municipalities by a given year.
   *
   * @param year The year to calculate the medians
   */
  getAgeGroupPerMunicipalityByYear(
    year: number,
    minAge: number,
    maxAge: number
  ): InternMap {
    return rollup(
      this.populationData.filter((entry: Population) => entry.year == year),
      (v) => this.calcAgeBucketPercentageRate(v, minAge, maxAge),
      (d) => d.municipality_number
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

  /**
   * getter for Population Data of one Municipality
   * @param id of municipality
   * @returns Population[] of this municipality
   */
  private getPopulationDataPerMunicipality(id: number): Population[] {
    return this.populationData.filter((p) => {
      return p.municipality_number === id;
    });
  }

  /**
   * Maps Population according to 5-Years AgeGroups
   * @param id of municipality
   */
  public getPopulationNumbersAgeGroupsPerMunicipality(
    id: number
  ): PopulationByGroups[][] {
    let pop = this.getPopulationDataPerMunicipality(id);
    let popByYearAndGroups = [];
    for (let i = 2003; i < 2023; i++) {
      let popByYear = pop.filter((p) => p.year === i);
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
    return popByYearAndGroups;
  }

  public getMax(population: PopulationByGroups[][]): number {
    let max = 0;
    for (let pop of population) {
      pop.map((p) => {
        if (p.population > max) {
          max = p.population;
        }
      });
    }
    return max;
  }
  public getMunicipalityName(id: number): string {
    let pop = this.populationData.filter((p) => p.municipality_number === id);

    return pop[0].municipality;
  }

  /**
   * Calculate the median of an array of {@link Population} entries which have populations grouped in age buckets.
   *
   * @param populations
   */
  private calcMedian(populations: Population[]) {
    return median(
      populations.flatMap((pop: Population) => {
        return new Array(pop.population).fill(pop.age);
      })
    );
  }

  /**
   * Calculate the percentage of an age bucket in relation to the total population.
   * e.g. how many percentage is the age group within the interval [10, 20] years.
   *
   * @param populations the population data
   * @param from the lower age boundary (inclusive)
   * @param to the upper age boundary (inclusive)
   * @private
   */
  private calcAgeBucketPercentageRate(
    populations: Population[],
    from: number,
    to: number
  ) {
    const totalAgeGroup = populations
      .filter((value) => from <= value.age && value.age <= to)
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue.population,
        0
      );

    const totalPopulation = populations.reduce(
      (accumulator, currentValue) => accumulator + currentValue.population,
      0
    );

    return {
      percentageAgeGroup: totalAgeGroup / totalPopulation,
      totalAgeGroup: totalAgeGroup,
      total: totalPopulation,
    };
  }
}
