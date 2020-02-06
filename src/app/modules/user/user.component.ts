import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Apollo } from 'apollo-angular';
//import { Observable } from 'rxjs/Observable';
//import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ClubService } from '../club/club.service';

const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

const clubMutation = gql`mutation addUserToClub($id: String!){addUserToClub(clubId: $id){_id}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  private user;
  private examResults;
  private url;
  private clubs;
  private clubForm: FormGroup;

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private clubService: ClubService,
    private router: Router,
    private http: HttpClient,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private fb: FormBuilder
  ) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;

    this.clubs = this.clubService.clubs;
    this.clubForm = this.fb.group({
      clubId: ''
    });
  }

  openAddClub(content) {
    this.modalService.open(content);
  }

  onClubSubmit() {
    this.apollo.mutate<any>({
      mutation: clubMutation,
      variables: {
        id: this.clubId.value
      }
    }).subscribe((response) => { 
      //console.log('[User] Adding Club: ',response.data );
    }); 
    console.log('Your choice: ',this.clubId.value);
  }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      console.log('Token found. Querying exam results!');

      this.apollo.watchQuery<any>({
        query: queryExamResults,
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response) => {
        this.examResults = response.data.getAllExamResults;
        this.examResults.forEach(ele => {
          const date = new Date(ele.date);
          ele.date = date.toLocaleDateString();
        });

        console.log(this.examResults);
        console.log('Done!');
      }, (err) => { console.log('GraphQL error: ', JSON.stringify(err.graphQLErrors[0].message)) });

    }
    this.user = this.authService.user;
  }

  getReport() {
    return this.http.get(this.examResults[0].reportUri);
  }

  get clubId() {
    return this.clubForm.get('clubId');
  }

}
