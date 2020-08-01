import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphQLBasicService } from './services/graphql-basic.service';
import { GraphQLService } from './services/graphql.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    GraphQLBasicService,
    GraphQLService
  ]
})
export class GraphqlModule { }
