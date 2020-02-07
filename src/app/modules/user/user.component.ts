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

const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

const clubMutation = gql`mutation addUserToClub($id: String!){addUserToClub(clubId: $id){_id}}`;
const maMutation = gql`mutation addMartialArtRankToUser($maId: String!, $name: String!, $number: Number!)
{addMartialArtRankToUser(maRank: {
  _id: $maId, rankName: $name, rankNumber: $number})
{_id}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user;
  examResults;
  url;
  clubs;
  martialArts;
  clubForm: FormGroup;
  maForm: FormGroup;
  userForm: FormGroup;
  maError;

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

    this.martialArts = maService.getMartialArts();
    this.maForm = this.fb.group({
      maId: 0,
      rankName: '',
      rankNumber: ''
    });
    this.clubs = this.clubService.clubs;
    this.clubForm = this.fb.group({
      clubId: ''
    });
    console.table(this.martialArts);
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  onClubSubmit() {
    this.apollo.mutate<any>({
      mutation: maMutation,
      variables: {
        id: this.clubId.value
      }
    }).subscribe((response) => { 
      //console.log('[User] Adding Club: ',response.data );
    }); 
  }

  onMaSubmit() {
    //this.user.martialArts.push({_id: this.martialArts[this.maId.value], rankName: this.rankName.value});
    console.log(this.martialArts[this.maId.value].ranks.filter(rank => rank.name == this.rankName.value)[0].number);
    this.apollo.mutate<any>({
      mutation: clubMutation,
      variables: {
        maId: this.martialArts[this.maId.value]._id,
        name: this.rankName.value,
        number: this.martialArts[this.maId.value].ranks.filter(rank => rank.name == this.rankName.value)[0].number
      }
    }).subscribe((response) => { 
      console.log('[UserComp] Response: ',response);
    }, (err) => this.maError = err);
  }

  ngOnInit() {
    if (localStorage.getItem('token')) {
      console.log('Token found. Querying exam results!');

      this.apollo.watchQuery<any>({
        query: queryExamResults,
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response) => {
        this.examResults = response.data.getAllExamResults;
        console.log(this.examResults);
        this.examResults.forEach(ele => {
          const date = new Date(ele.date);
          ele.date = date.toLocaleDateString();
        });

        console.log(this.examResults);
        console.log('Done!');
      }, (err) => { console.log('GraphQL error: ', JSON.stringify(err.graphQLErrors[0].message)) });

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
            if (filename)
                downloadLink.setAttribute('download', filename);
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

}
