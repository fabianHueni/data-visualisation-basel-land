/**
 * The interface for the 'Bevölkerung nach Gemeinde' datafile.
 */
export interface Population {
  /**
   * The calendar year
   */
  year: number;

  /**
   * An identifier for the municipality
   */
  municipality_number: number;

  /**
   * Name of the municipality
   */
  municipality: string;

  /**
   * The sex of the corresponding data entry.
   * 1 - Male
   * 2 - Female
   */
  sex: number;

  /**
   * The age for the corresponding data entry.
   * e.g. 23 or 5
   */
  age: number;

  /**
   * The number of persons who live in this municipality and are {@link age} years old.
   */
  population: number;
}

export interface PopulationByGroups {
  /**
   * The calendar year
   */
  year: number;

  /**
   * The age for the corresponding data entry.
   * e.g. 0-4
   */
  ageGroup: string;

  /**
   * The number of persons who live in this municipality and are {@link age} years old.
   */
  population: number;

  /**
   * sex
   */
  sex?: number;
}

export interface Municipality {
  id: number;
  name: string;
}

export interface PopulationBySex {
  sex: number;
  age: number;
  year: number;
  population: number;
}
