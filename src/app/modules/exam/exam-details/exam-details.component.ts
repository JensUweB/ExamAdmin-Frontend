import { Component, OnInit } from '@angular/core';
import { ExamService } from '../exam.service';
import { Exam } from '../../models/exam.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
 private exam: Exam;
 private user: User;
 private editExam: boolean;
 private clubs;

  constructor(private examService: ExamService, private authService: AuthService) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
    this.user = this.authService.user;
    this.clubs = this.examService.getCurrentClubs();
    console.log('[ExamDetails] Clubs Array: ',this.clubs);
  }

}
