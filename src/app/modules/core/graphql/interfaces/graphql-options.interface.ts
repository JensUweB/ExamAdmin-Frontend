/**
 * Options for graphql requests
 */
import { GraphQLType } from '../enums/graphql-type.enum';

export interface IGraphQLOptions {
  arguments?: any;
  fields?: any;
  log?: boolean;
  model?: any;
  type?: GraphQLType;
  excludedErrors?: string | string[];
  loading?: boolean;
}
