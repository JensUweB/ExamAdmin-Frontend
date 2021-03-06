import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from './exam.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit, OnDestroy {
  private examSubscription: Subscription;
  private userSubscription: Subscription;
  plannedExams;
  user;
  showPlanned = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private examService: ExamService
  ) {}

  async ngOnInit() {
    await this.examService.fetchExams();
    this.examSubscription = this.examService.exams.subscribe(data => this.plannedExams = data);
    this.userSubscription = this.authService.user.subscribe(data => this.user = data);
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

  ngOnDestroy() {
    this.examSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
