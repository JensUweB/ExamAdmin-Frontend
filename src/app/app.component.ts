import { Component } from '@angular/core';
import { AuthService } from './modules/auth/auth.service';
import { ExamService } from './modules/exam/exam.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Exam-Admin Frontend';


  constructor(private authService: AuthService, private examService: ExamService) {
    if(localStorage.getItem('token')) this.authService.loadUser();
  }

}
