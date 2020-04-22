import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClubService } from '../club/club.service';
import { MartialArtsService } from '../martialArts/martialArts.service';
import { Alert } from '../types/Alert';
import { Subscription } from 'rxjs';
import { UserService } from './user.service';
import { normalizeDate } from '../helpers/date.helper';
import { getGraphQLError, logError } from '../helpers/error.helpers';

const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

const clubMutation = gql`mutation addUserToClub($id: String!){addUserToClub(clubId: $id){_id}}`;
const maMutation = gql`mutation addMartialArtRankToUser($id: String!, $rankId: String!)
{addMartialArtRankToUser(userId: "", maRank: {_id: $id, rankId: $rankId}){_id}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy{
  private authSubscription: Subscription;
  private maSubscription: Subscription;
  user;
  examResults = [];
  url;
  clubs;
  martialArts;
  clubForm: FormGroup;
  maForm: FormGroup;
  userForm: FormGroup;
  maError;
  alerts: Alert[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private userService: UserService,
    private clubService: ClubService,
    private maService: MartialArtsService,
    private router: Router,
    private http: HttpClient,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private fb: FormBuilder
  ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = true;

    this.maForm = this.fb.group({
      maId: ['', Validators.required],
      rankId: ['', Validators.required],
    });
    /*this.clubs = this.clubService.clubs;
    this.clubForm = this.fb.group({
      clubId: ''
    });*/
    this.ngOnInit();
    this.userForm = this.fb.group({
      firstName: [this.user.firstName, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      email: [this.user.email, Validators.required],
      password: ['', Validators.required],
      newPassword: '',
      newPassword2: '',
      clubs: null,
      martialArts: null
    });
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  onClubSubmit() {
    this.apollo.mutate<any>({
      mutation: clubMutation,
      variables: {
        id: this.clubId.value
      }
    }).subscribe((response) => { 
      if(response.errors) console.log('[User] ',response.errors );
    }, (err) => {
      this.printError(err);
    });
  }

  async onMaSubmit() {
    if(!this.maForm.valid) { return false; }
    let id = this.martialArts[this.maId.value]._id;

    this.apollo.mutate<any>({
      mutation: maMutation,
      variables: {
        id,
        rankId: this.rankId.value,
      }
    }).subscribe((response) => { 
      this.authService.loadUser();
      this.alerts.push({type:"success", message: 'Success! You added a new martial art to your profile!'});
      console.log('[UserComp] Success!');
    }, (err) => {
      this.printError(err);
    });
  }

  async ngOnInit() {
    console.log('[UserComp] Querying Data...');

    this.apollo.watchQuery<any>({
      query: queryExamResults,
      fetchPolicy: 'no-cache'
    }).valueChanges.subscribe((response) => {
      this.examResults = response.data.getAllExamResults;
      this.examResults.forEach(ele => {
        ele.date = normalizeDate(ele.date);
      });
    }, (err) => {
      this.printError(err);
    });

    this.authSubscription = await this.authService.user.subscribe(data => this.user = data);
    this.maSubscription = await this.maService.martialArts.subscribe(data => this.martialArts = data);
    console.log('[UserComp] Done!');
  }

  printError(err) {
    logError('[UserComponent]',err);
    this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  showMaDetails(ma) {
    this.maService.setCurrent(ma, false);
    this.router.navigateByUrl('/martialArt-details');
  }

  async onUserUpdate() {
    if(this.userForm.valid && this.newPassword.value == this.newPassword2.value) {
      await this.userService.updateUser({
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        password: this.password.value,
        newPassword: this.newPassword.value
      });
      this.authService.loadUser();
      // Updating this.user object manualy because fetching from authservice doesn't work correctly here
      this.user.firstName = this.firstName.value;
      this.user.lastName = this.lastName.value;
      this.user.email = this.email.value;
    }
  }

  /**
   * A Method to download and display any file
   * @param reportUri 
   * @param filename 
   */
  downloadFile(reportUri: string, filename: string = null): void{
    const token = this.authService.token;
    const headers = new HttpHeaders().set('authorization','Bearer '+token);
    this.http.get(reportUri,{headers, responseType: 'blob' as 'json'}).subscribe(
        (response: any) =>{
            let dataType = response.type;
            let binaryData = [];
            binaryData.push(response);
            let downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            //downloadLink.target = '_blank';
            if (filename){
                downloadLink.setAttribute('download', filename);
            }
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
  )}

  get clubId() {
    return this.clubForm.get('clubId');
  }

  get maId() {
    return this.maForm.get('maId');
  }

  get rankId() {
    return this.maForm.get('rankId');
  }

  get password() {
    return this.userForm.get('password');
  }

  get newPassword() {
    return this.userForm.get('newPassword');
  }

  get newPassword2() {
    return this.userForm.get('newPassword2');
  }

  get firstName() {
    return this.userForm.get('firstName');
  }

  get lastName() {
    return this.userForm.get('lastName');
  }

  get email() {
    return this.userForm.get('email');
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert));
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.maSubscription.unsubscribe();
  }

}
