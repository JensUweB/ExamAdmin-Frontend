import { Component, OnInit, OnDestroy } from '@angular/core';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { normalizeDateTime } from '../helpers/date.helper';

const examsQuery = gql`query getPlannedExams{getPlannedExams{
  _id, title, description, examDate, regEndDate, isPublic, club{name}, martialArt{name, styleName}
}}`;

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit, OnDestroy{
  private exams;
  private querySubscription: Subscription;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: examsQuery
    }).valueChanges.subscribe((response) => {
      if(response.data){
          this.exams = response.data.getPlannedExams;
          this.exams.forEach(exam => {
            exam.examDate = normalizeDateTime(exam.examDate);
            exam.regEndDate = normalizeDateTime(exam.regEndDate);
        });
      }
    }, (err) => {console.log(err.graphQLErrors[0].message);});
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
