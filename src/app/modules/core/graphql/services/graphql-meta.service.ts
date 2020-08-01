import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema, IntrospectionQuery } from 'graphql';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { GraphQLMeta } from '../classes/graphql-meta.class';
import { Helper } from '../../classes/helper.class';

@Injectable({
  providedIn: 'root',
})
export class GraphQLMetaService {
  // Caches
  protected _frozenSchema: GraphQLSchema;
  protected _frozenSchemaObservable: Observable<GraphQLSchema>;
  protected _meta: GraphQLMeta;
  protected _metaObservable: Observable<GraphQLMeta>;
  protected _schemaObservable: Observable<GraphQLSchema>;

  /**
   * Include services
   */
  constructor(protected apollo: Apollo) {}

  // Private caches
  private _introspectionQuery: IntrospectionQuery;

  /**
   * Getter of introspectionQuery
   */
  get introspectionQuery(): IntrospectionQuery {
    return JSON.parse(JSON.stringify(this._introspectionQuery));
  }

  /**
   * Get schema for API
   * @See https://www.apollographql.com/blog/three-ways-to-represent-your-graphql-schema-a41f4175100d
   */
  public getSchema(options: { cache?: boolean; freeze?: boolean } = {}): Observable<GraphQLSchema> {
    // Get configurations
    const config = {
      cache: true,
      freeze: true,
      ...options,
    };

    // Use caching
    if (config.cache) {
      if (config.freeze && this._frozenSchema) {
        return of(this._frozenSchema);
      }
      if (this._introspectionQuery) {
        return of(buildClientSchema(this.introspectionQuery));
      }
      if (config.freeze && this._frozenSchemaObservable) {
        return this._frozenSchemaObservable;
      } else if (!config.freeze && this._schemaObservable) {
        return this._schemaObservable;
      }
    }

    // Request schema from server
    const observable = this.apollo
      .query({
        query: gql(getIntrospectionQuery({ descriptions: false })),
      })
      .pipe(
        map((schema: any) => {
          // Cache introspectionQuery
          this._introspectionQuery = schema.data;

          // Convert schema to GraphQLSchema
          this._frozenSchema = Helper.deepFreeze(buildClientSchema(this.introspectionQuery));

          // Return GraphQLSchema
          if (config.freeze) {
            return this._frozenSchema;
          }
          return buildClientSchema(schema.data);
        })
      );

    // Set observables
    if (config.freeze) {
      this._frozenSchemaObservable = observable;
    } else {
      this._schemaObservable = observable;
    }

    // Return result
    return observable;
  }

  /**
   * Get meta for API
   * See https://www.apollographql.com/blog/three-ways-to-represent-your-graphql-schema-a41f4175100d
   */
  public getMeta(options: { cache?: boolean } = {}): Observable<GraphQLMeta> {
    // Get configurations
    const config = {
      cache: true,
      ...options,
    };

    // Use caching
    if (config.cache) {
      if (this._meta) {
        return of(this._meta);
      } else if (this._metaObservable) {
        return this._metaObservable;
      }
    }

    // Request schema from server
    const observable = this.getSchema(options).pipe(
      map((schema: any) => {
        this._meta = new GraphQLMeta(schema);
        return this._meta;
      })
    );

    // Set observables
    this._metaObservable = observable;

    // Return result
    return observable;
  }
}
