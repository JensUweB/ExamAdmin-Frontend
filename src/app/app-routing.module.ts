import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './modules/auth/auth..component';
import { UserComponent } from './modules/user/user.component';
import { StartComponent } from './modules/start/start.component';


const routes: Routes = [
  {path: '', component: StartComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'user', component: UserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
