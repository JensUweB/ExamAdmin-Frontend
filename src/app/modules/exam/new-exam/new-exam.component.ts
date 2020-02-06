import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { MartialArt } from '../../models/martialArt.model';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

const newExamQuery = gql`mutation createExam
($title: String!, $description: String!, $examDate: Date!, $regEndDate: Date!, $isPublic: Boolean, $clubId: String!, $userId: String, $maId: String!)
{createExam(input: {
  title: $title
  description: $description
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

  private user: User;
  private isExaminer = false;
  private martialArts = [];
  private examForm: FormGroup;
  private isSubmitted: boolean = false;
  private formSubscription: Subscription;
  private error;

  constructor(
    private apollo: Apollo, 
    private authService: AuthService, 
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
      minRank: [null, [Validators.required, Validators.minLength(2)]],
      examDate: [null, [Validators.required]],
      examTime: [null, [Validators.required]],
      regEndDate: [null, [Validators.required]],
      regEndTime: [null, [Validators.required]],
      fee: [null, [Validators.pattern('[-+]?([0-9]*\.[0-9]+|[0-9]+)')]],
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
  get fee () {
    return this.examForm.get('fee');
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

      const result = await this.apollo.mutate<any>({
        mutation: newExamQuery,
        variables: {
          title: this.title.value,
          description: this.description.value,
          examDate: new Date(this.examDate.value + ' ' + this.examTime.value),
          regEndDate: new Date(this.regEndDate.value + ' ' + this.regEndTime.value),
          isPublic: this.isPublic.value,
          clubId: this.club.value,
          userId: this.user._id,
          maId: this.martialArts[this.martialArt.value]._id
        }
      }).subscribe(response => {
        if(response.data) console.log('[NewExamComp] New exam successfull created!');
        if(response.errors) console.warn('[NewExamComp] ERROR: ', response.errors);
      }, (err) => {
        this.error = err;
        console.warn('[NewExamComp]: GraphQL Error:',err);
      });

      this.isSubmitted = true;
    } else {
      console.log('[NewExamComp] Your form is NOT valid!');
    }
  }
}
