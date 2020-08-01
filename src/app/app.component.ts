import { Component } from '@angular/core';
import { AuthService } from './modules/auth/auth.service';
import { ExamService } from './modules/exam/exam.service';
import { MartialArtsService } from './modules/martialArts/martialArts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Exam-Admin Frontend';

  constructor(
    private authService: AuthService
  ) {
    if (localStorage.getItem('token')) {
      this.authService.loadUser();
    }
  }

}
