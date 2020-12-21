import { NgModule } from '@angular/core';
import { GraphQLService } from './services/graphql.service';
import { ApolloModule, Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClientModule } from '@angular/common/http';

/* export function createApollo(httpLink: HttpLink) {
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
} */

@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ],
  providers: [
    /* {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    }, */
    GraphQLService,
  ],
})
export class GraphqlModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    const uri = environment.backendurl;
    const http = httpLink.create({ uri });

    const middleware = new ApolloLink((operation, forward) => {
      const token = localStorage.getItem('token');
      if (token) {
        operation.setContext({
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        });
      }
      return forward(operation);
    });

    apollo.create({
      link: middleware.concat(http),
      cache: new InMemoryCache()
    });
  }
}
