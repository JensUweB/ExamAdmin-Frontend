import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ClubService } from '../club/club.service';
import { MartialArtsService } from '../martialArts/martialArts.service';
import { Alert } from '../types/Alert';

const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

const clubMutation = gql`mutation addUserToClub($id: String!){addUserToClub(clubId: $id){_id}}`;
const maMutation = gql`mutation addMartialArtRankToUser($id: String!, $name: String!, $number: Float!)
{addMartialArtRankToUser(userId: "", maRank: {
  _id: $id, rankName: $name, rankNumber: $number})
{_id}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
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
    config.keyboard = false;

    this.martialArts = maService.martialArts;
    this.maForm = this.fb.group({
      maId: 0,
      rankName: '',
      rankNumber: ''
    });
    this.clubs = this.clubService.clubs;
    this.clubForm = this.fb.group({
      clubId: ''
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
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
    });
  }

  onMaSubmit() {
    //this.user.martialArts.push({_id: this.martialArts[this.maId.value], rankName: this.rankName.value});
    console.log(this.martialArts[this.maId.value].ranks.filter(rank => rank.name == this.rankName.value)[0].number);
    let number = this.martialArts[this.maId.value].ranks.filter(rank => rank.name == this.rankName.value)[0].number;
    let id = this.martialArts[this.maId.value]._id;

    this.apollo.mutate<any>({
      mutation: maMutation,
      variables: {
        id,
        name: this.rankName.value,
        number
      }
    }).subscribe((response) => { 
      this.authService.user.martialArts.push({_id: id, rankName: this.rankName.value, rankNumber: number});
      this.alerts.push({type:"success", message: 'Success! You added a new martial art to your profile!'});
      console.log('[UserComp] Success!');
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.log('[Usercomp] GraphQl Error: ',JSON.stringify(err));
    });
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
        console.log('[UserComp] Done!');
      }, (err) => {
        this.alerts.push({type: 'danger', message: err});
      });

    }
    this.user = this.authService.user;
    console.log('[UserComp] User from AuthService: ',this.authService.user);
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

  get rankName() {
    return this.maForm.get('rankName');
  }
  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert));
  }

}
