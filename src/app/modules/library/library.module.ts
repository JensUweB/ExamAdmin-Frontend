import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExamComponent } from './exam/exam.component';
import { ExamDetailsComponent } from './exam/exam-details/exam-details.component';
import { ExamResultComponent } from './exam/exam-result/exam-result.component';
import { NewExamComponent } from './exam/new-exam/new-exam.component';
import { ExamService } from './exam/exam.service';
import { MartialArtsComponent } from './martialArts/martialArts.component';
import { MartialartDetailsComponent } from './martialArts/martialart-details/martialart-details.component';
import { NewMartialartComponent } from './martialArts/new-martialart/new-martialart.component';
import { MartialArtsService } from './martialArts/martialArts.service';
import { GraphqlModule } from '../core/graphql/graphql.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    DashboardComponent,
    ExamComponent,
    ExamDetailsComponent,
    ExamResultComponent,
    NewExamComponent,
    MartialArtsComponent,
    MartialartDetailsComponent,
    NewMartialartComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    GraphqlModule,
  ],
  exports: [
    DashboardComponent,
    ExamComponent,
    ExamDetailsComponent,
    ExamResultComponent,
    NewExamComponent,
    MartialArtsComponent,
    MartialartDetailsComponent,
    NewMartialartComponent,
  ],
  providers: [
    ExamService,
    MartialArtsService,
  ]
})
export class LibraryModule { }
