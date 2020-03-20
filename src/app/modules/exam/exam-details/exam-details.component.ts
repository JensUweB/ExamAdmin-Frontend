import { Component, OnInit } from '@angular/core';
import { ExamService } from '../exam.service';
import { Exam } from '../../models/exam.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../../types/Alert';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getGraphQLError } from '../../helpers/error.helpers';

const query = gql`mutation registerToExam($examId: String!){registerToExam(examId: $examId)}`;
const unregister = gql`mutation unregisterFromExam($examId: String!){unregisterFromExam(examId: $examId)}`;
const deleteQuery = gql`mutation deleteExam($examId: String!){deleteExam(examId: $examId)}`;
const updateQuery = gql`mutation updateExam($examId: String!, $title: String!, $description: String!, $price: Float!, $address: String!, 
$examDate: DateTime, $regEndDate: DateTime, $isPublic: Boolean, $clubId: String!, $userId: String, $maId: String!)
{updateExam(
  examId: $examId, input: {
  title: $title
  description: $description
  price: $price
  examPlace: $address
  examDate: $examDate
  regEndDate: $regEndDate
  isPublic: $isPublic
  club: $clubId
  examiner: $userId
  martialArt: $maId}){_id}}`;


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
 examForm: FormGroup;
 clubs;
 alerts: Alert[] = [];

  constructor(
    private examService: ExamService, 
    private authService: AuthService, 
    private apollo: Apollo, 
    private fb: FormBuilder, 
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
    this.user = this.authService.user;
    this.clubs = this.examService.getCurrentClubs();

    this.hasCheckedIn = this.exam.participants.some(user => user._id == this.user._id);

    this.examForm = this.fb.group({
      title: [this.exam.title],
      description: [this.exam.description],
      examPlace: [this.exam.examPlace],
      price: [this.exam.price],
      examDate: [this.exam.examDate],
      regEndDate: [this.exam.regEndDate],
      club: [this.exam.club._id],
      examiner: [this.exam.examiner._id],
      martialArt: [this.exam.martialArt._id],
      isPublic: [this.exam.isPublic],
    });

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
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: getGraphQLError(err)});
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
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: getGraphQLError(err)});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[Exam]: GraphQL Error:',JSON.stringify(err));
    });
  }

  onUpdate() {
    console.log('DATE:', this.examDate.value);
    this.apollo.mutate<any>({
      mutation: updateQuery,
      variables: {
        examId: this.exam._id,
        title: this.title.value,
        description: this.description.value,
        price: this.price.value,
        address: this.examPlace.value,
        examDate: null,
        regEndDate: null,
        isPublic: this.isPublic.value,
        clubId: this.club.value,
        maId: this.martialArt.value
      }
    }).subscribe((response) => { 
      this.alerts.push({type:"success", message: 'Update Successful!'});
      console.log('[Auth] Update Successful!');
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn(JSON.stringify(err));
    });
  }

  onDelete() {
    this.examService.exams = this.examService.exams.filter(exam => exam._id != this.exam._id);

    this.apollo.mutate<any>({
      mutation: deleteQuery,
      variables: {
        examId: this.exam._id
      }
    }).subscribe((response) => { 
      this.alerts.push({type:"success", message: 'Delete Successful!'});
      console.log('[Auth] Update Successful!');
      this.router.navigate(['/exams']);
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn(JSON.stringify(err));
    });
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  get martialArt() {
    return this.examForm.get('martialArt');
  }
  get club () {
    return this.examForm.get('club');
  }
  get title () {
    return this.examForm.get('title');
  }
  get description () {
    return this.examForm.get('description');
  }
  get price () {
    return this.examForm.get('price');
  }
  get examPlace () {
    return this.examForm.get('examPlace');
  }
  get minRank () {
    return this.examForm.get('minRank');
  }
  get examDate () {
    return this.examForm.get('examDate');
  }
  get examTime () {
    return this.examForm.get('examTime');
  }
  get regEndDate () {
    return this.examForm.get('regEndDate');
  }
  get regEndTime () {
    return this.examForm.get('regEndTime');
  }
  get isPublic () {
    return this.examForm.get('isPublic');
  }
}
