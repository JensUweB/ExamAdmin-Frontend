import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './modules/header/header.component';
import { AuthComponent } from './modules/auth/auth.component';
import { UserComponent } from './modules/user/user.component';
import { MartialArtsComponent } from './modules/martialArts/martialArts.component';
import { ExamComponent } from './modules/exam/exam.component';
import { ClubComponent } from './modules/club/club.component';
import { UmbrellaAssocComponent } from './modules/umbrellaAssoc/umbrellaAssoc.component';
import { StartComponent } from './modules/start/start.component';
import { ExamResultComponent } from './modules/exam/exam-result/exam-result.component';
import { GraphQLModule } from './apollo.config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExamDetailsComponent } from './modules/exam/exam-details/exam-details.component';
import { ExamService } from './modules/exam/exam.service';
import { NewExamComponent } from './modules/exam/new-exam/new-exam.component';
import { MartialArtsService } from './modules/martialArts/martialArts.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ClubService } from './modules/club/club.service';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    HeaderComponent,
    AuthComponent,
    UserComponent,
    MartialArtsComponent,
    ExamComponent,
    ClubComponent,
    UmbrellaAssocComponent,
    ExamResultComponent,
    ExamDetailsComponent,
    NewExamComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    GraphQLModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [ExamService, MartialArtsService, ClubService],
  bootstrap: [AppComponent]
})
export class AppModule { }
