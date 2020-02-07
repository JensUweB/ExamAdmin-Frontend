import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExamService } from './exam.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit{
  exams;
  user;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.exams = this.examService.getExams();
    this.user = this.authService.user;
  }
  showDetails(exam: any): void {
    this.examService.setExam(exam);
    this.router.navigate(['/exam-details']);
  }

  showEdit(exam: any): void {
    this.examService.setExam(exam);
    this.examService.editExam = true;
    this.router.navigate(['/exam-details']);
  }

}
