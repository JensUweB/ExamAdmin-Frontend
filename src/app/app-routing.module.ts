import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './modules/auth/auth.component';
import { UserComponent } from './modules/user/user.component';
import { StartComponent } from './modules/start/start.component';
import { ExamComponent } from './modules/exam/exam.component';
import { MartialArtsComponent } from './modules/martialArts/martialArts.component';
import { ClubComponent } from './modules/club/club.component';
import { AuthGuard } from './modules/auth/auth.guard';
import { ExamDetailsComponent } from './modules/exam/exam-details/exam-details.component';
import { NewExamComponent } from './modules/exam/new-exam/new-exam.component';
import { ExamResultComponent } from './modules/exam/exam-result/exam-result.component';
import { NewMartialartComponent } from './modules/martialArts/new-martialart/new-martialart.component';
import { MartialartDetailsComponent } from './modules/martialArts/martialart-details/martialart-details.component';
import { PasswordResetComponent } from './modules/auth/components/password-reset/password-reset.component';


const routes: Routes = [
  {path: '', component: StartComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'auth/password-reset/:token', component: PasswordResetComponent},
  {path: 'user', canActivate: [AuthGuard], component: UserComponent},
  {path: 'exams', canActivate: [AuthGuard], component: ExamComponent},
  {path: 'new-exams', canActivate: [AuthGuard], component: NewExamComponent},
  {path: 'exam-details', canActivate: [AuthGuard],  component: ExamDetailsComponent},
  {path: 'exam-results', canActivate: [AuthGuard], component: ExamResultComponent},
  {path: 'martialArts', canActivate: [AuthGuard], component: MartialArtsComponent},
  {path: 'martialArt-details', canActivate: [AuthGuard], component: MartialartDetailsComponent},
  {path: 'new-martialArt', canActivate: [AuthGuard], component: NewMartialartComponent},
  {path: 'clubs', canActivate: [AuthGuard], component: ClubComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
