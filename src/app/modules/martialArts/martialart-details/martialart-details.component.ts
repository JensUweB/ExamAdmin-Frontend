import { Component, OnInit, Output } from '@angular/core';
import { MartialArt } from '../../models/martialArt.model';
import { MartialArtsService } from '../martialArts.service';
import { User } from '../../models/user.model';
import { Apollo } from 'apollo-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import gql from 'graphql-tag';
import { Alert } from '../../types/Alert';

const query = gql`mutation addExaminer($maId: String!, $email: String!)
{addExaminer(maId: $maId, email: $email){_id}}`;
const queryRemove = gql`mutation removeExaminer($maId: String!, $userId: String!)
{removeExaminer(maId: $maId, userId: $userId){_id}}`;

@Component({
  selector: 'app-martialart-details',
  templateUrl: './martialart-details.component.html',
  styleUrls: ['./martialart-details.component.scss']
})
export class MartialartDetailsComponent implements OnInit {
  @Output() ma: MartialArt;
  alerts: Alert[] = [];
  editMode: Boolean;
  examinerForm: FormGroup;

  constructor(
    private maService: MartialArtsService,
    private apollo: Apollo,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) {
    this.ma = maService.martialArt;
    this.editMode = maService.editMode;

    this.examinerForm = this.fb.group({
      email: ['', Validators.required],
    });
   }

   onSubmit() {
     if(this.examinerForm.valid) {
      this.apollo.mutate<any>({
        mutation: query,
        variables: {
          maId: this.ma._id,
          email: this.email.value,
        },
      }).subscribe(response => {
        if (response.data) {
          this.alerts.push({type:"success", message: 'New examiner was added!'});
          console.log('[NewMartialArtComp] Done.');
          this.maService.fetch();
        }
      }, (err) => {
        if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
        else this.alerts.push({type: 'danger', message: err});
        console.warn('[ExamResult] ', JSON.stringify(err));
      });
     }
   }

   onRemove(userId: string) {
     this.apollo.mutate<any>({
        mutation: queryRemove,
        variables: {
          maId: this.ma._id,
          userId: userId,
        },
      }).subscribe(response => {
        if (response.data) {
          this.ma.examiners = this.ma.examiners.filter(user => user._id != userId);
          this.alerts.push({type:"success", message: 'Examiner was removed!'});
          console.log('[NewMartialArtComp] Done.');
        }
      }, (err) => {
        if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
        else this.alerts.push({type: 'danger', message: err});
        console.warn('[ExamResult] ', JSON.stringify(err));
      });
   }

  ngOnInit(): void {
  }

  showEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert));
  }

  get email() {
    return this.examinerForm.get('email');
  }
}
