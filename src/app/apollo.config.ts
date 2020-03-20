import {NgModule} from '@angular/core';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';

import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { environment } from '../environments/environment';


@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    const uri = environment.backendurl;
    const http = httpLink.create({ uri });

    const middleware = new ApolloLink((operation, forward) => {
      const token = localStorage.getItem('token');
      if (token) {
        operation.setContext({
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        });
        console.log('[Apollo] Found local token. Adding bearer token!');
      }
      return forward(operation);
    });

    apollo.create({
      link: middleware.concat(http),
      cache: new InMemoryCache()
    });
  }
}