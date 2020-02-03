import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { normalizeDateTime } from '../helpers/date.helper';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExamService } from './exam.service';

const examsQuery = gql`query getPlannedExams{getPlannedExams{
  _id, title, description, examDate, regEndDate, isPublic, examPlace , club{name}, martialArt{name, styleName}, examiner{_id, firstName, lastName}
}}`;

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit, OnDestroy{
  private exams;
  @Output('currentExam') exam = new EventEmitter<any>();
  private user;
  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo, 
    private router: Router, 
    private authService: AuthService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: examsQuery
    }).valueChanges.subscribe((response) => {
      if(response.data){
          this.exams = response.data.getPlannedExams;
          this.exams.forEach(exam => {
            exam.examDate = normalizeDateTime(exam.examDate);
            exam.regEndDate = normalizeDateTime(exam.regEndDate);
            exam.isHidden = true;
        });
      }
    }, (err) => {console.log(err.graphQLErrors[0].message);});
    this.user = this.authService.user;
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
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
