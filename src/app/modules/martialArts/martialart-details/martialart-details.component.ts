import { Component, OnInit, Output } from '@angular/core';
import { MartialArt } from '../../models/martialArt.model';
import { MartialArtsService } from '../martialArts.service';
import { User } from '../../models/user.model';
import { Apollo } from 'apollo-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import gql from 'graphql-tag';
import { Alert } from '../../types/Alert';
import { logError, getGraphQLError } from '../../helpers/error.helpers';

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
          this.maService.fetch();
          this.maService.setCurrent(this.ma, false);
          this.ma = this.maService.martialArt;
          this.alerts.push({type:"success", message: 'New examiner was added!'});
          console.log('[MADetailsComp] Done. ');
        }
      }, (err) => {
        this.printError(err);
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
        this.printError(err);
      });
   }

  ngOnInit(): void {
  }

  printError(err) {
    logError('[UserComponent]',err);
    this.alerts.push({type: 'danger', message: getGraphQLError(err)});
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
