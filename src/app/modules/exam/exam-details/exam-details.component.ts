import { Component, OnInit } from '@angular/core';
import { ExamService } from '../exam.service';
import { Exam } from '../../models/exam.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { error } from 'protractor';

const query = gql`mutation registerToExam($examId: String!){registerToExam(examId: $examId)}`;

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
 exam: Exam;
 user: User;
 editExam: boolean;
 clubs;
 errors = [];

  constructor(private examService: ExamService, private authService: AuthService, private apollo: Apollo) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
    this.user = this.authService.user;
    this.clubs = this.examService.getCurrentClubs();
  }

  onParticipate() {
    this.apollo.mutate<any>({
      mutation: query,
      variables: {
        examId: this.exam._id,
      }
    }).subscribe(response => {
      if(response.data) console.log('[Exam] Ok, you now are listed as participant!');
    }, (err) => {
      if(err.graphQLErrors.length)  this.errors.push('Code: '+err.graphQLErrors[0].message.statusCode + ' - ' + err.graphQLErrors[0].message.error + ' - ' + err.graphQLErrors[0].message.message);
      else this.errors.push(err);
      console.warn('[Exam]: GraphQL Error:',JSON.stringify(err));
    });
  }
}
