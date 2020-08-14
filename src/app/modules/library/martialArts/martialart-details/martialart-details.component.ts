import { Component, OnInit, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MartialArt } from '../../../core/classes/martialArt.class';
import { MartialArtsService } from '../martialArts.service';
import { User } from '../../../core/classes/user.class';
import { Apollo } from 'apollo-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import gql from 'graphql-tag';
import { Alert } from '../../../types/Alert';
import { logError, getGraphQLError } from '../../../shared/helpers/error.helpers';
import { AuthService } from '../../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

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
  editMode: boolean;
  examinerForm: FormGroup;
  isExaminer = false;
  displayedColumns = ['name', 'rank'];
  displayedRankColumns = ['number', 'rank'];

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
      // Check if current user is an examiner
      if (this.user) {
        this.isExaminer = this.ma.examiners.some(item => item._id === this.user._id);
      }
    });

    this.examinerForm = this.fb.group({
      email: ['', Validators.required],
    });
   }

   async onSubmit() {
     if (this.examinerForm.valid) {
      if (!environment.production) { console.log('[MADetailsComp] Adding new examiner... '); }
      this.apollo.mutate<any>({
        mutation: query,
        variables: {
          maId: this.ma._id,
          email: this.email.value,
        },
      }).subscribe(async response => {
        if (response.data) {
          // Fetch updates and pull the updated martial art to this component
          if (!environment.production) { console.log('[MADetailsComp] Fetching updates... '); }
          this.maService.fetch()
          .then(() => {
            this.maService.setCurrent(this.ma, false);
            this.ma = this.maService.martialArt;
            this.router.navigateByUrl('martialArt-details');
            if (!environment.production) { console.log('[MADetailsComp] Done. '); }
          });
          this.alerts.push({type: 'success', message: 'New examiner was added!'});
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
          userId,
        },
      }).subscribe(response => {
        if (response.data) {
          this.ma.examiners = this.ma.examiners.filter(user => user._id !== userId);
          this.alerts.push({type: 'success', message: 'Examiner was removed!'});
          if (!environment.production) { console.log('[NewMartialArtComp] Done.'); }
        }
      }, (err) => {
        this.printError(err);
      });
   }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  printError(err) {
    logError('[UserComponent]', err);
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
