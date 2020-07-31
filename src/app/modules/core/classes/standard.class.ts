/**
 * Standard class
 * Other classes should extend the Standard class, if they offer own functions
 * If the extended class uses object properties with own map functions, it should implement its own map function
 * (see Structure class)
 */
import { Helper } from './helper.class';

/**
 * Standard class for basic class properties
 */
export class Standard {
  /**
   * Static map method
   */
  public static map<T extends Standard>(
    this: new (...args: any[]) => T,
    data: Partial<T> | { [key: string]: any },
    item: T = new this()
  ): T {
    return (item as any).map(data);
  }

  /**
   * Map data into an object
   */
  public map(data: Partial<this> | { [key: string]: any }): this {
    return Helper.map(data, this);
  }

  /**
   * Clone object (and map additional data)
   */
  public clone(mapData?: Partial<this> | { [key: string]: any }): this {
    const current = JSON.parse(JSON.stringify(this));
    if (mapData) {
      Object.assign(current, mapData);
    }
    return new (this as any).constructor().map(current);
  }
}
