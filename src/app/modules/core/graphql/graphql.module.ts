import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphQLService } from './services/graphql.service';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { environment } from 'src/environments/environment';

export function createApollo(httpLink: HttpLink) {
  const link = httpLink.create({
    uri: environment.backendurl,
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    const headers: any = {};
    if (localStorage) {
      const token = localStorage.getItem('token') || null;
      if (token) {
        headers.Authorization = 'Bearer ' + token;
      }
      operation.setContext(() => ({ headers }));
    }
    return forward(operation);
  });

  return {
    link: ApolloLink.from([authMiddleware, link]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
      },
    },
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
    GraphQLService,
  ],
})
export class GraphqlModule { }
