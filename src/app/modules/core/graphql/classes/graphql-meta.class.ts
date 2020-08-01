import { GraphQLSchema } from 'graphql';
import { GraphQLNamedType } from 'graphql/type/definition';
import { GraphQLType } from '../enums/graphql-type.enum';
import { Helper } from '../../classes/helper.class';

export class GraphQLMeta {
  // Frozen caches
  protected args: Record<string, any> = {};
  protected fields: Record<string, any> = {};

  /**
   * Integrate schema
   */
  constructor(protected schema: GraphQLSchema) {
    if (!schema) {
      throw Error('Missing schema');
    }
  }

  /**
   * Get arguments of GraphQL function
   */
  getArgs(functionName: string, options: { cache?: boolean; freeze?: boolean; type?: GraphQLType } = {}) {
    const { cache, freeze, type } = {
      cache: true,
      freeze: true,
      type: undefined,
      ...options,
    };

    // Get cache
    if (cache && freeze) {
      const args = this.args[functionName + type];
      if (args) {
        return args;
      }
    }

    const func = this.getFunction(functionName, { type });
    const result = {};
    if (func?.args) {
      func.args.forEach((item) => {
        result[item.name] = this.getDeepType(item.type);
      });
    }

    // Set cache
    if (freeze) {
      this.args[functionName + type] = Helper.deepFreeze(result);
    }

    return result;
  }

  /**
   * Get fields of GraphQL function
   */
  getFields(functionName: string, options: { cache?: boolean; freeze?: boolean; type?: GraphQLType } = {}) {
    const { cache, freeze, type } = {
      cache: true,
      freeze: true,
      type: undefined,
      ...options,
    };

    // Get cache
    if (cache && freeze) {
      const args = this.fields[functionName + type];
      if (args) {
        return args;
      }
    }

    const func = this.getFunction(functionName, options);
    const result = this.getDeepType(func.type);

    // Set cache
    if (freeze) {
      this.fields[functionName + type] = Helper.deepFreeze(result);
    }

    return result;
  }

  /**
   * Get GraphQL function
   */
  protected getFunction(name: string, options: { type?: GraphQLType } = {}) {
    // Set config
    const config = {
      ...options,
    };

    // Init possible functions
    let functions = {};

    // If function type is set
    if (config.type) {
      const graphQLType = config.type.charAt(0).toUpperCase() + config.type.slice(1);
      const type = this.schema.getType(graphQLType);
      if (type) {
        functions = (type as any).getFields();
      }
    } else {
      ['Subscription', 'Mutation', 'Query'].forEach((item) => {
        const type: any = this.schema.getType(item);
        if (type) {
          functions = {
            ...functions,
            ...(type.getFields() || {}),
          };
        }
      });
    }

    // Get function via name
    return functions[name];
  }

  /**
   * Get type
   */
  protected getType(name: string): GraphQLNamedType {
    return this.schema.getType(name);
  }

  /**
   * Get deep type data
   */
  protected getDeepType(type: any, prepared: WeakMap<any, any> = new WeakMap()): any {
    // Check type
    if (!type) {
      return type;
    }

    const preparedObject = {};

    // Check prepared
    if (typeof type === 'object') {
      const preparedType = prepared.get(type);
      if (preparedType) {
        return preparedType;
      }

      // Set prepared
      prepared.set(type, preparedObject);
    }

    // Search deeper
    if (type.ofType) {
      const ofTypeResult = this.getDeepType(type.ofType, prepared);
      Object.assign(preparedObject, ofTypeResult);
      return ofTypeResult;
    }

    // Process fields
    if (type._fields) {
      const result = {};
      for (const [key, value] of Object.entries(type._fields)) {
        result[key] = this.getDeepType(value, prepared);
      }
      Object.assign(preparedObject, result);
      return result;
    }

    // Get type name
    if (type.type) {
      const typeResult = this.getDeepType(type.type, prepared);
      Object.assign(preparedObject, typeResult);
      return typeResult;
    }

    // Return scalar type
    prepared.set(type, type.name);
    return type.name;
  }
}
