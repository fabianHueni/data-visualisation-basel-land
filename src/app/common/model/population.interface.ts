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
   * The age for the corresponding data entry.
   * e.g. 23 or 5
   */
  age: number;

  /**
   * The number of persons who live in this municipality and are {@link age} years old.
   */
  population: number;
}
