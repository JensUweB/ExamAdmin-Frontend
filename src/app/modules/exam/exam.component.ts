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
  plannedExams;
  user;
  showPlanned = true;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private examService: ExamService
  ) {}

  async ngOnInit() {
    console.log('[ExamComp] Initializing...');
    this.plannedExams = await this.examService.getExams();
    this.user = this.authService.user;
    console.log('[ExamComp] Done.');
  }
  showDetails(exam: any): void {
    this.examService.setExam(exam);
    this.examService.editExam = false;
    this.router.navigate(['/exam-details']);
  }

  showEdit(exam: any): void {
    this.examService.setExam(exam);
    this.examService.editExam = true;
    this.router.navigate(['/exam-details']);
  }

}
