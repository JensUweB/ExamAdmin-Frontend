import { Standard } from './standard.class';

/**
 * Helper class
 */
export class Helper {
  /**
   * Simple filter function for plain objects
   */
  static filter<T = { [key: string]: any }>(objects: T[], filter: { [key: string]: any }): T[] {
    return (objects?.filter((element) => {
      for (const [key, value] of Object.entries(filter)) {
        if (Array.isArray(element[key])) {
          for (const item of element[key]) {
            if (!element[key].includs(value)) {
              return false;
            }
          }
        } else if (element[key] !== value) {
          return false;
        }
      }
      return true;
    }) || []) as any[];
  }

  /**
   * Convert to a url/uri conform string
   * Only:
   * - lower case
   * - chars, numbers and hyphens
   */
  static urlString(str: any, options: { allowAll?: boolean } = {}): string {
    // Config
    const config = {
      allowAll: false,
      ...options,
    };

    // To string
    str = str + '';

    // Trim
    str = str.trim();

    // Lower case
    str = str.toLowerCase();

    if (!config.allowAll) {
      // Replace spaces
      str = str.trim().replace(/\s+/g, '-');

      // Replace some special chars
      str = str.replace('ä', 'ae');
      str = str.replace('ö', 'oe');
      str = str.replace('ü', 'ue');
      str = str.replace('ß', 'ss');

      // Remove other special chars
      str = str.replace(/[^a-zA-Z0-9-]/g, '');
    }

    // Return url conform string
    return encodeURI(str);
  }

  /**
   * Simple map function
   */
  public static map<T = { [key: string]: any }>(
    source: Partial<T> | { [key: string]: any },
    target: T,
    options: { funcAllowed?: boolean } = {}
  ): T {
    // Set config
    const config = {
      funcAllowed: false,
      ...options,
    };

    // Check source
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return target;
    }

    // Update properties
    for (const key of Object.keys(target)) {
      if (source[key] !== undefined && (config.funcAllowed || typeof (source[key] !== 'function'))) {
        target[key] = source[key];
      }
    }

    // Return target
    return target;
  }

  /**
   * Create Object or Objects of specified type with specified data
   */
  public static maps<T extends Standard>(
    data: Partial<T> | Partial<T>[] | { [key: string]: any } | { [key: string]: any }[],
    targetClass: new (...args: any[]) => T
  ): T[] {
    // Check data
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    // Check array
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Map
    return (data as any).map((item) => {
      return (targetClass as any).map(item);
    });
  }

  /**
   * Get plain parameter
   */
  public static getPlainParameter(parameter: string) {
    if (!parameter) {
      return parameter;
    }
    return parameter.split('?').shift().split('#').shift();
  }

  /**
   * Get ID of an url parameter
   */
  public static getParameterId(parameter: string) {
    if (!parameter) {
      return parameter;
    }
    return Helper.getPlainParameter(parameter).split('-').pop();
  }

  /**
   * Delay
   */
  public static delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Deep freeze
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#What_is_shallow_freeze
   */
  public static deepFreeze(object, preparedObjects = []) {
    // Prevent infinit regress
    if (preparedObjects.includes(object)) {
      return object;
    }
    preparedObjects.push(object);

    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self
    for (const name of propNames) {
      const value = object[name];

      if (value && typeof value === 'object') {
        Helper.deepFreeze(value, preparedObjects);
      }
    }

    return Object.freeze(object);
  }

  /**
   * Generates an unique identifier with 24 characters
   */
  public static getUID(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }

  /**
   * Converts a date to german date format
   * @param input date string
   */
  normalizeDate(input: string): string {
    const date = new Date(input);
    const str: string[] = date.toLocaleDateString().split('.');
    if (str.length && str.length > 0 && str[0].padStart) {
        return str[0].padStart(2, '0') + '.' + str[1].padStart(2, '0') + '.' + str[2];
    }
  }
}
