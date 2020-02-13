import { Component, OnInit } from '@angular/core';
import { ExamService } from '../exam.service';
import { Exam } from '../../models/exam.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../../types/Alert';

const query = gql`mutation registerToExam($examId: String!){registerToExam(examId: $examId)}`;
const unregister = gql`mutation unregisterFromExam($examId: String!){unregisterFromExam(examId: $examId)}`;

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
 exam: Exam;
 user: User;
 hasCheckedIn: boolean;
 editExam: boolean;
 clubs;
 alerts: Alert[] = [];

  constructor(private examService: ExamService, private authService: AuthService, private apollo: Apollo) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
    this.user = this.authService.user;
    this.clubs = this.examService.getCurrentClubs();

    this.hasCheckedIn = this.exam.participants.some(user => user._id == this.user._id);
  }

  onCheckIn() {
    this.apollo.mutate<any>({
      mutation: query,
      variables: {
        examId: this.exam._id,
      }
    }).subscribe(response => {
      if(response.data){ 
        this.hasCheckedIn = true;
        this.exam.participants.push(this.user);
        this.alerts.push({type:"success", message: 'Success! You are now registered as participant.'});
        console.log('[Exam] Ok, you now are listed as participant!');
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[Exam]: GraphQL Error:',JSON.stringify(err));
    });
  }
  onCheckOut() {
    this.apollo.mutate<any>({
      mutation: unregister,
      variables: {
        examId: this.exam._id,
      }
    }).subscribe(response => {
      if(response.data){ 
        this.hasCheckedIn = false;
        this.exam.participants = this.exam.participants.filter(user => user._id != this.user._id);
        this.alerts.push({type: 'success', message: 'Success! You are now removed from the participants list.'});
        console.log('[Exam] Ok, you now are listed as participant!');
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[Exam]: GraphQL Error:',JSON.stringify(err));
    });
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
