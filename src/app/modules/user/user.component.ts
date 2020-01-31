import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Apollo } from 'apollo-angular';
//import { Observable } from 'rxjs/Observable';
//import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

const getUser = gql`{getUser{_id, firstName, lastName, email, martialArts{name, styleName, ranks{name, number}}, clubs{club{name}}}}`;
const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, martialArt{name, styleName},rank}}`;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit{
  private user;
  private examResults;

  constructor(private apollo: Apollo, private authService: AuthService, private router: Router) {}

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
    if(!this.user) this.router.navigate(['/auth']);
    
  }
}
