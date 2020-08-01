import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExamService } from './exam.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

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
    if (!environment.production) { console.log('[ExamComponent] Initializing...'); }
    await this.examService.fetchExams();
    this.examSubscription = this.examService.exams.subscribe(data => this.plannedExams = data);
    this.userSubscription = this.authService.user.subscribe(data => this.user = data);
    if (!environment.production) { console.log('[ExamComponent] Done.'); }
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
