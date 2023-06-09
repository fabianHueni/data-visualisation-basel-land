import { Injectable } from '@angular/core';
import { dsv, InternMap, median, rollup, rollups } from 'd3';
import {
  Municipality,
  Population,
  PopulationByGroups,
} from '../model/population.interface';
import { Observable } from 'rxjs';

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

export const AGE_GROUPS_10: string[] = [
  '0-9',
  '10-19',
  '20-29',
  '30-39',
  '40-49',
  '50-59',
  '60-69',
  '70-79',
  '80-89',
  '90-99',
  '100+',
];

@Injectable({
  providedIn: 'root',
})
export class PopulationService {
  private readonly URL = 'assets/data/bevoelkerung_nach_gemeinde_edited.csv';
  private populationData: Population[] = [];

  private numberOfWorkersPerCityAndYear = new Map<string, number>();

  constructor() {
    this.loadPopulationData();
  }

  /**
   * Initialize the population data.
   */
  public initializeData(): Promise<Population[]> {
    return this.loadPopulationData();
  }

  /**
   * Returns the age median for all municipalities by a given year.
   *
   * @param year The year to calculate the medians
   */
  public getAgeMedianPerMunicipalityByYear(year: number, sex = 0): InternMap {
    const res = rollup(
      this.populationData.filter((entry: Population) => {
        // 0 is default for sex and means all. Therefore, only check sex if it is not 0.
        // console.log(entry.sex + ' - ' + sex);
        return entry.year === year && (sex === 0 || entry.sex === sex);
      }),
      (v) => this.calcMedian(v),
      (d) => d.municipality_number
    );
    return res;
  }

  /**
   * Returns the percentage of an age group for all municipalities by a given year.
   *
   * @param year The year to calculate the medians
   * @param minAge The minimum age of the age group
   * @param maxAge The maximum age of the age group
   * @param sex The gender to get the age group for
   */
  public getAgeGroupPerMunicipalityByYear(
    year: number,
    minAge: number,
    maxAge: number,
    sex = 0
  ): InternMap {
    return rollup(
      this.populationData.filter(
        (entry: Population) =>
          // 0 is default for sex and means all. Therefore, only check sex if it is not 0.
          entry.year == year && (sex == 0 || entry.sex == sex)
      ),
      (v) => this.calcAgeBucketPercentageRate(v, minAge, maxAge),
      (d) => d.municipality_number
    );
  }

  /**
   * Returns the median for each year for a given municipality.
   *
   * @param municipalityId The municipality id to calculate the medians for
   */
  public getMedianAgePerYearByMunicipality(
    municipalityId: number
  ): Promise<InternMap> {
    return new Promise((resolve, reject) => {
      const result = rollup(
        this.getPopulationDataPerMunicipality(municipalityId),
        (v) => this.calcMedian(v),
        (d) => d.year
      );
      resolve(result);
    });
  }

  /**
   * Returns the youth quotient for each year for a given municipality.
   *
   * @param municipalityId The municipality id to calculate the medians for
   */
  public getYouthQuotientAgePerYearByMunicipality(
    municipalityId: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const result = [];
      for (let year = 2003; year <= 2022; year++) {
        result.push({
          year,
          value: this.getYouthQuotient(municipalityId, year),
        });
      }
      resolve(result);
    });
  }

  /**
   * Returns the senior quotient for each year for a given municipality.
   *
   * @param municipalityId The municipality id to calculate the medians for
   */
  public getSeniorQuotientAgePerYearByMunicipality(
    municipalityId: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const result = [];
      for (let year = 2003; year <= 2022; year++) {
        result.push({
          year,
          value: this.getSeniorQuotient(municipalityId, year),
        });
      }
      resolve(result);
    });
  }

  /**
   * Returns the full quotient for each year for a given municipality.
   *
   * @param municipalityId The municipality id to calculate the medians for
   */
  public getFullQuotientAgePerYearByMunicipality(
    municipalityId: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const result = [];
      for (let year = 2003; year <= 2022; year++) {
        result.push({
          year,
          value: this.getFullQuotient(municipalityId, year),
        });
      }
      resolve(result);
    });
  }

  /**
   * Maps Population according to 5-Years AgeGroups
   * @param id of municipality
   */
  public getPopulationNumbersAgeGroupsPerMunicipality(
    id: number
  ): PopulationByGroups[][] {
    const pop = this.getPopulationDataPerMunicipality(id);
    const popByYearAndGroups = [];
    for (let i = 2003; i < 2023; i++) {
      const popByYear = pop.filter((p) => p.year === i);
      const popByGroups: PopulationByGroups[] = [];
      for (const g of AGE_GROUPS) {
        popByGroups.push({
          year: i,
          ageGroup: g,
          population: 0,
        });
      }
      for (const p of popByYear) {
        const index = Math.floor(p.age / 5);
        popByGroups[index].population += p.population;
      }
      popByYearAndGroups.push(popByGroups);
    }
    return popByYearAndGroups;
  }

  public getMax(population: PopulationByGroups[][]): number {
    let max = 0;
    for (const pop of population) {
      pop.map((p) => {
        if (p.population > max) {
          max = p.population;
        }
      });
    }
    return max;
  }

  /**
   * Returns a list of all distinct municipalities with their id and name.
   */
  public getAllMunicipalities(): Municipality[] {
    return [
      ...new Map(
        this.populationData.map((item) => [
          item.municipality,
          {
            name: item.municipality,
            id: item.municipality_number,
          },
        ])
      ).values(),
    ];
  }

  /**
   * Returns the youth quotient of a given municipality for a given year.
   * If the municipally is 0, then the quotient for the whole canton is returned.
   *
   * According to
   * https://www.bfs.admin.ch/bfs/de/home/statistiken/querschnittsthemen/wohlfahrtsmessung/alle-indikatoren/gesellschaft/altersquotient.html
   *
   * @param municipalityId The id of the municipally
   * @param year The year to calculate the quotient
   */
  public getYouthQuotient(municipalityId: number, year = 2022) {
    return (
      this.getNumberOfYouth(municipalityId, year) /
      this.getNumberOfWorkers(municipalityId, year)
    );
  }

  /**
   * Returns the senior quotient of a given municipality for a given year.
   * If the municipally is 0, then the quotient for the whole canton is returned.
   *
   * According to
   * https://www.bfs.admin.ch/bfs/de/home/statistiken/querschnittsthemen/wohlfahrtsmessung/alle-indikatoren/gesellschaft/altersquotient.html
   *
   * @param municipalityId The id of the municipally
   * @param year The year to calculate the quotient
   */
  public getSeniorQuotient(municipalityId: number, year = 2022) {
    return (
      this.getNumberOfSeniors(municipalityId, year) /
      this.getNumberOfWorkers(municipalityId, year)
    );
  }

  /**
   * Returns the full quotient of a given municipality for a given year.
   * If the municipally is 0, then the quotient for the whole canton is returned.
   *
   * According to
   * https://www.bfs.admin.ch/bfs/de/home/statistiken/querschnittsthemen/wohlfahrtsmessung/alle-indikatoren/gesellschaft/altersquotient.html
   *
   * @param municipalityId The id of the municipally
   * @param year The year to calculate the quotient
   */
  public getFullQuotient(municipalityId: number, year = 2022) {
    return (
      (this.getNumberOfYouth(municipalityId, year) +
        this.getNumberOfSeniors(municipalityId, year)) /
      this.getNumberOfWorkers(municipalityId, year)
    );
  }

  /**
   * Returns the number of inhabitants for one municipality.
   *
   * @param municipalityId The id of the municipally
   * @param sex The gender to calculate the number of inhabitants for. 0 is default and means all.
   * @param year The year to calculate the number of inhabitants for.
   */
  public getNumberOfInhabitants(municipalityId: number, sex = 0, year = 2022) {
    return this.getPopulationDataPerMunicipality(municipalityId)
      .filter(
        (entry: Population) =>
          entry.year === year && (sex === 0 || entry.sex === sex)
      )
      .reduce((a, b) => a + b.population, 0);
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
              sex: parseInt(<string>v['geschlecht_code']),
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
    if (id === 0) {
      return this.populationData;
    }
    return this.populationData.filter((p) => {
      return p.municipality_number === id;
    });
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

  /**
   * Returns the number of workers (20 <= X <=64) in a municipality for a given year.
   * @param municipalityId The id of the municipality
   * @param year The year to select the data for
   * @private
   */
  private getNumberOfWorkers(municipalityId: number, year: number): number {
    const identifier = municipalityId + '-' + year;
    if (this.numberOfWorkersPerCityAndYear.has(identifier)) {
      return this.numberOfWorkersPerCityAndYear.get(identifier) ?? 0;
    } else {
      this.numberOfWorkersPerCityAndYear.set(
        identifier,
        this.getPopulationDataPerMunicipality(municipalityId)
          .filter(
            (entry: Population) =>
              entry.year === year && entry.age > 19 && entry.age <= 64
          )
          .reduce((a, b) => a + b.population, 0)
      );
      return this.numberOfWorkersPerCityAndYear.get(identifier) ?? 0;
    }
  }

  /**
   * Returns the number of youth (<=19) in a municipality for a given year.
   *
   * @param municipalityId The id of the municipality
   * @param year The year to select the data for
   * @private
   */
  private getNumberOfYouth(municipalityId: number, year: number): number {
    return this.getPopulationDataPerMunicipality(municipalityId)
      .filter((entry: Population) => entry.year === year && entry.age <= 19)
      .reduce((a, b) => a + b.population, 0);
  }

  /**
   * Returns the number of seniors (>=65) in a municipality for a given year.
   *
   * @param municipalityId The id of the municipality
   * @param year The year to select the data for
   * @private
   */
  private getNumberOfSeniors(municipalityId: number, year: number): number {
    return this.getPopulationDataPerMunicipality(municipalityId)
      .filter((entry: Population) => entry.year === year && entry.age >= 65)
      .reduce((a, b) => a + b.population, 0);
  }

  public getPopulationByYearAndMunicipality(
    year: number,
    municipality_number: number
  ): Population[] {
    let population = this.getPopulationDataPerMunicipality(
      municipality_number
    ).filter((p: Population) => p.year === year);
    if (municipality_number === 0) {
      population = this.concatPopulationOfMunicipality(population, year);
    }
    return population;
  }

  private concatPopulationOfMunicipality(
    population: Population[],
    year: number
  ): Population[] {
    let concatedData: Population[] = [];
    for (let age = 0; age <= 100; age++) {
      let popDataByAge = population.filter((entry) => entry.age === age);
      let malePopulation: Population = {
        age: age,
        municipality: 'Kanton',
        municipality_number: 0,
        year: year,
        sex: 1,
        population: 0,
      };
      let femalePopulation: Population = {
        age: age,
        municipality: 'Kanton',
        municipality_number: 0,
        year: year,
        sex: 2,
        population: 0,
      };
      for (const p of popDataByAge) {
        if (p.sex === 1) {
          malePopulation.population += p.population;
        } else {
          femalePopulation.population += p.population;
        }
      }
      concatedData.push(malePopulation, femalePopulation);
    }
    return concatedData;
  }

  public getPopulationByYearAndMunicipality5YearAgeGroup(
    year: number,
    municipality_number: number
  ): PopulationByGroups[] {
    const pop = this.getPopulationByYearAndMunicipality(
      year,
      municipality_number
    );
    const popByGroupsM: PopulationByGroups[] = [];
    const popByGroupsF: PopulationByGroups[] = [];
    for (const g of AGE_GROUPS) {
      popByGroupsM.push({
        year: year,
        ageGroup: g,
        population: 0,
        sex: 1,
      });
      popByGroupsF.push({
        year: year,
        ageGroup: g,
        population: 0,
        sex: 2,
      });
    }
    for (const p of pop) {
      const index = Math.floor(p.age / 5);
      p.sex === 1
        ? (popByGroupsM[index].population += p.population)
        : (popByGroupsF[index].population += p.population);
    }
    return popByGroupsM.concat(...popByGroupsF);
  }

  public getPopulationByYearAndMunicipality10YearAgeGroup(
    year: number,
    municipality_number: number
  ): PopulationByGroups[] {
    const pop = this.getPopulationByYearAndMunicipality(
      year,
      municipality_number
    );
    const popByGroupsM: PopulationByGroups[] = [];
    const popByGroupsF: PopulationByGroups[] = [];
    for (const g of AGE_GROUPS_10) {
      popByGroupsM.push({
        year: year,
        ageGroup: g,
        population: 0,
        sex: 1,
      });
      popByGroupsF.push({
        year: year,
        ageGroup: g,
        population: 0,
        sex: 2,
      });
    }
    for (const p of pop) {
      const index = Math.floor(p.age / 10);
      p.sex === 1
        ? (popByGroupsM[index].population += p.population)
        : (popByGroupsF[index].population += p.population);
    }
    return popByGroupsM.concat(...popByGroupsF);
  }
}
