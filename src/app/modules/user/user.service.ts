import { AuthService } from "../auth/auth.service";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Alert } from "../types/Alert";
import { Injectable } from '@angular/core';
import { getGraphQLError, logError } from '../helpers/error.helpers';
import { BehaviorSubject } from 'rxjs';
import { normalizeDate } from '../helpers/date.helper';

const updateUserMutation = gql`
  mutation updateUser(
    $newPassword: String!
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    updateUser(
      newPassword: $newPassword
      input: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
      }
    ) {
      _id
    }
  }
`;
const queryExamResults = gql`query getAllExamResults{getAllExamResults{_id, user, exam, date, passed, reportUri , martialArt{name, styleName},rank}}`;

@Injectable()
export class UserService {
  alerts: Alert[] = [];
  private examResultsArray = [];
  private _examResults: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public readonly examResults = this._examResults.asObservable();

  constructor(private apollo: Apollo, private authService: AuthService) {
    this.fetch();
  }

  printError(err) {
    logError('[UserComponent]',err);
    this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  /**
   * 
   * @param input: { newPassword, firstname, lastName, email, clubs[ ], martialArts[ ] }
   */
  async updateUser(input: Object) {
    await this.apollo
      .watchQuery<any>({
        query: updateUserMutation,
        fetchPolicy: "no-cache",
        variables: input
      })
      .valueChanges.subscribe(
        (response) => {
          console.log("[UserService] Done!");
        },
        (err) => {
          this.printError(err);
        }
      );
  }

  async fetch() {
    this.apollo.watchQuery<any>({
      query: queryExamResults,
      fetchPolicy: 'no-cache'
    }).valueChanges.subscribe((response) => {
      this.examResultsArray = response.data.getAllExamResults;
      this.examResultsArray.forEach(ele => {
        ele.date = normalizeDate(ele.date);
      });
      this._examResults.next(this.examResultsArray);
    }, (err) => {
      this.printError(err);
    });
  }
}
