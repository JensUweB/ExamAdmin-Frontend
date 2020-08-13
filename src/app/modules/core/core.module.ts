import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { GraphqlModule } from './graphql/graphql.module';



@NgModule({
  imports: [
    CommonModule,
    GraphqlModule,
  ],
  declarations: [],
  exports: [],
  providers: [ToastService]
})
export class CoreModule { }
