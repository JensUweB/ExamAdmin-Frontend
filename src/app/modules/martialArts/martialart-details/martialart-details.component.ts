import { Component, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { MartialArt } from '../../models/martialArt.model';
import { MartialArtsService } from '../martialArts.service';
import { User } from '../../models/user.model';
import { Apollo } from 'apollo-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import gql from 'graphql-tag';
import { Alert } from '../../types/Alert';
import { logError, getGraphQLError } from '../../helpers/error.helpers';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

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
  private userSubscription: Subscription;
  user: User;
  alerts: Alert[] = [];
  editMode: Boolean;
  examinerForm: FormGroup;

  constructor(
    private maService: MartialArtsService,
    private authService: AuthService,
    private apollo: Apollo,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.ma = maService.martialArt;
    this.editMode = maService.editMode;
    this.userSubscription = authService.user.subscribe(data => {
      this.user = data;
    });

    // Check if current user is an examiner
    

    this.examinerForm = this.fb.group({
      email: ['', Validators.required],
    });
   }

   async onSubmit() {
     if(this.examinerForm.valid) {
      console.log('[MADetailsComp] Adding new examiner... ');
      this.apollo.mutate<any>({
        mutation: query,
        variables: {
          maId: this.ma._id,
          email: this.email.value,
        },
      }).subscribe(async response => {
        if (response.data) {
          // Fetch updates and pull the updated martial art to this component
          console.log('[MADetailsComp] Fetching updates... ');
          this.maService.fetch()
          .then(() => {
            this.maService.setCurrent(this.ma, false);
            this.ma = this.maService.martialArt;
            this.router.navigateByUrl('martialArt-details');
            console.log('[MADetailsComp] Done. ');
          });
          this.alerts.push({type:"success", message: 'New examiner was added!'});
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
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
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
