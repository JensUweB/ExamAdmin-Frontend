import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Apollo } from 'apollo-angular';
//import { Observable } from 'rxjs/Observable';
//import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit{
  private user;
  private examResults;
  private url;

  constructor(
    private apollo: Apollo, 
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient) {}

  ngOnInit() {
    if(localStorage.getItem('token')){
      console.log('Token found. Querying exam results!');
      
      this.apollo.watchQuery<any>({
        query: queryExamResults
      }).valueChanges.subscribe((response) => { 
        this.examResults = response.data.getAllExamResults;
        this.examResults.forEach(ele => {
          const date = new Date(ele.date);
          ele.date = date.toLocaleDateString();
        });
        
        console.log(this.examResults);
        console.log('Done!');
      }, (err) => {console.log('GraphQL error: ',JSON.stringify(err.graphQLErrors[0].message))});
      
    }
    this.user = this.authService.user;
  }

  getReport() {
    return this.http.get(this.examResults[0].reportUri);
  }

}
