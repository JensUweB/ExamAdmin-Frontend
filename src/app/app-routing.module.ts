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


const routes: Routes = [
  {path: '', component: StartComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'user', canActivate: [AuthGuard], component: UserComponent},
  {path: 'exams', canActivate: [AuthGuard], component: ExamComponent},
  {path: 'exam-details',  component: ExamDetailsComponent},
  {path: 'martialArts', canActivate: [AuthGuard], component: MartialArtsComponent},
  {path: 'clubs', canActivate: [AuthGuard], component: ClubComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
