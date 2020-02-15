import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { MartialArt } from '../../models/martialArt.model';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../../types/Alert';
import { ExamService } from '../exam.service';
import { Exam } from '../../models/exam.model';

const newExamQuery = gql`mutation createExam
($title: String!, $description: String!, $price: Float!, $address: String!, $examDate: DateTime!, $regEndDate: DateTime!, 
$isPublic: Boolean, $clubId: String!, $userId: String, $maId: String!)
{createExam(input: {
  title: $title
  description: $description
  price: $price
  examPlace: $address
  examDate: $examDate
  regEndDate: $regEndDate
  isPublic: $isPublic
  club: $clubId
  examiner: $userId
  martialArt: $maId})
  {_id}}`;

@Component({
  selector: 'app-new-exam',
  templateUrl: './new-exam.component.html',
  styleUrls: ['./new-exam.component.css']
})
export class NewExamComponent implements OnInit, OnDestroy{

  user: User;
  isExaminer = false;
  martialArts = [];
  examForm: FormGroup;
  isSubmitted: boolean = false;
  formSubscription: Subscription;
  alerts: Alert[] = [];

  constructor(
    private apollo: Apollo, 
    private authService: AuthService, 
    private examService: ExamService,
    config: NgbTimepickerConfig, 
    private fb: FormBuilder
  ) {
    config.seconds = false;
    config.spinners = false;

    this.user = authService.user;

    // Check, what martial arts the user is allowed to examine and creates an array with these martial arts
    this.user.martialArts.forEach(ma => {
      let res = ma._id.examiners.some(ele => ele._id == this.user._id);
      if (res) this.martialArts.push(ma._id);
    });

    if (this.martialArts.length > 0) this.isExaminer = true;
    console.log('[NewExamComp] ', this.martialArts);
  }

  ngOnInit() {
    this.examForm = this.fb.group({
      martialArt: [null, [Validators.required]],
      club: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(15)]],
      examPlace: ['', [Validators.required, Validators.minLength(10)]],
      minRank: [null, [Validators.required, Validators.minLength(2)]],
      examDate: [null, [Validators.required]],
      examTime: [null, [Validators.required]],
      regEndDate: [null, [Validators.required]],
      regEndTime: [null, [Validators.required]],
      price: [0, [Validators.pattern('[-+]?([0-9]*\.[0-9]+|[0-9]+)')]],
      isPublic: false,
    });

    this.formSubscription = this.examForm.valueChanges.subscribe();
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

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }

  //($title: String!, $description: String!, $examDate: Date!, $regEndDate: Date!, $isPublic: Boolean, $clubId: String!, $userId: String, $maId: String!)
  async onSubmit() {
    if(this.examForm.valid) {
      console.log('[NewExamComp] Your form is valid!');

      var examDate = new Date(this.regEndDate.value.year, this.examDate.value.month, this.examDate.value.day, this.examTime.value.hour,this.examTime.value.minute,this.examTime.value.second, 0);
      var regEndDate = new Date(this.regEndDate.value.year, this.regEndDate.value.month, this.regEndDate.value.day, this.regEndTime.value.hour,this.regEndTime.value.minute,this.regEndTime.value.second, 0);

      console.log(this.regEndDate.value.year, this.examDate.value.month, this.examDate.value.day, this.examTime.value.hour,this.examTime.value.minute,this.examTime.value.second, 0);

      const result = await this.apollo.mutate<any>({
        mutation: newExamQuery,
        variables: {
          title: this.title.value,
          description: this.description.value,
          price: this.price.value,
          address: this.examPlace.value,
          examDate: examDate,
          regEndDate: regEndDate,
          isPublic: this.isPublic.value,
          clubId: this.club.value,
          userId: this.user._id,
          maId: this.martialArts[this.martialArt.value]._id
        }
      }).subscribe(response => {
        this.examService.fetchExams();
        this.alerts.push({type:"success", message: 'Success! A new exam was created.'});
        if(response.data) console.log('[NewExamComp] New exam successfull created!');
      }, (err) => {
        this.alerts.push({type: 'danger', message: err});
        console.warn('[NewExamComp]: GraphQL Error:',JSON.stringify(err));
      });
      this.isSubmitted = true;
    } else {
      console.log('[NewExamComp] Your form is NOT valid!');
    }
  }
  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
