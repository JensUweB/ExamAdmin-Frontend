import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { getGraphQLError, logError } from '../helpers/error.helpers';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExamResult } from '../models/examResult.model';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import { UserInput } from './inputs/user.input';


const clubMutation = gql`mutation addUserToClub($id: String!){addUserToClub(clubId: $id){_id}}`;
const maMutation = gql`mutation addMartialArtRankToUser($id: String!, $rankId: String!)
{addMartialArtRankToUser(userId: "", maRank: {_id: $id, rankId: $rankId}){_id}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {
  private authSubscription: Subscription;
  private maSubscription: Subscription;
  private erSubscription: Subscription;
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
  dataSource: MatTableDataSource<ExamResult[]>;
  displayedColumns = ['name', 'rank', 'result', 'date', 'file'];
  @ViewChild('examResultPagination', {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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

    this.authSubscription = this.authService.user.subscribe(data => this.user = data);
    this.maSubscription = this.maService.martialArts.subscribe(data => this.martialArts = data);
    this.erSubscription = this.userService.examResults.subscribe(data => this.examResults = data);

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

  ngOnInit() {
  }

  ngAfterViewInit() {
    // Material Table Stuff
    this.dataSource = new MatTableDataSource(this.examResults);
    this.cdr.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
      if (response.errors) { console.log('[User] ', response.errors ); }
    }, (err) => {
      this.printError(err);
    });
  }

  async onMaSubmit() {
    if (!this.maForm.valid) { return false; }
    const id = this.martialArts[this.maId.value]._id;

    this.apollo.mutate<any>({
      mutation: maMutation,
      variables: {
        id,
        rankId: this.rankId.value,
      }
    }).subscribe((response) => {
      this.authService.loadUser();
      this.alerts.push({type: 'success', message: 'Success! You added a new martial art to your profile!'});
      if (!environment.production) {console.log('[UserComp] Success!'); }
    }, (err) => {
      this.printError(err);
    });
  }

  printError(err) {
    console.log('[UserComponent]', JSON.stringify(err));
    this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  showMaDetails(ma) {
    this.maService.setCurrent(ma, false);
    this.router.navigateByUrl('/martialArt-details');
  }

  async onUserUpdate() {
    if (this.userForm.valid && this.newPassword.value === this.newPassword2.value) {
      const input: UserInput = {
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        password: this.password.value,
      };
      if (this.newPassword.touched) {
        await this.userService.updateUser(input, this.newPassword.value);
      } else {
        await this.userService.updateUser(input);
      }

      this.authService.loadUser();
      // Updating this.user object manualy because fetching from authservice doesn't work correctly here
      this.user.firstName = this.firstName.value;
      this.user.lastName = this.lastName.value;
      this.user.email = this.email.value;
    }
  }

  /**
   * A Method to download and display any file
   * @param reportUri the uri of the file to download
   * @param filename the name of the file
   */
  downloadFile(reportUri: string, filename: string = null): void {
    const token = this.authService.token;
    const headers = new HttpHeaders().set('authorization', 'Bearer ' + token);
    this.http.get(reportUri, {headers, responseType: 'blob' as 'json'}).subscribe(
        (response: any) => {
            const dataType = response.type;
            const binaryData = [];
            binaryData.push(response);
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            // downloadLink.target = '_blank';
            if (filename) {
                downloadLink.setAttribute('download', filename);
            }
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
  ); }

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
    this.erSubscription.unsubscribe();
  }

}
