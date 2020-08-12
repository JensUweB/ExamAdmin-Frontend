import { AuthService } from '../auth/auth.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Alert } from '../types/Alert';
import { Injectable } from '@angular/core';
import { getGraphQLError, logError } from '../helpers/error.helpers';
import { BehaviorSubject, Observable } from 'rxjs';
import { normalizeDate } from '../helpers/date.helper';
import { GraphQLService } from '../core/graphql/services/graphql.service';
import { ToastService } from '../core/services/toast.service';
import { GraphQLType } from '../core/graphql/enums/graphql-type.enum';
import { User } from '../models/user.model';
import { UserInput } from './inputs/user.input';

const queryExamResults = gql`
  query getAllExamResults {
    getAllExamResults {
      _id
      user
      exam
      date
      passed
      reportUri
      martialArt {
        name
        styleName
      }
      rank
    }
  }
`;

@Injectable()
export class UserService {
  alerts: Alert[] = [];
  private examResultsArray = [];
  private _examResults: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public readonly examResults = this._examResults.asObservable();

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private toastService: ToastService,
    private graphQlService: GraphQLService
  ) {
    this.fetch();
  }

  /**
   * Updates the current user
   * @param input: UserInput object
   */
  async updateUser(input: UserInput) {
    this.graphQlService
      .graphQl('updateUser', {
        arguments: { input },
        fields: ['_id'],
        type: GraphQLType.MUTATION,
        loading: true,
        log: true,
      }).subscribe(
        (response) => {
          this.toastService.success(
            'Daten Aktualisiert',
            'Ihre Daten wurden erfolgreich aktualisiert!'
          );
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            'Fehlschlag!',
            'Das aktualisieren ihrer Daten ist fehlgeschlagen!'
          );
        }
      );
  }

  async setUserPassword(newPassword: string) {
    const input = new UserInput();
    input.newPassword = newPassword;
    this.graphQlService
      .graphQl('updateUser', {
        arguments: { input },
        fields: ['_id'],
        type: GraphQLType.MUTATION,
        loading: true,
        log: true,
      })
      .subscribe(
        (response) => {
          this.toastService.success(
            'Daten Aktualisiert',
            'Ihre Daten wurden erfolgreich aktualisiert!'
          );
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            'Fehlschlag!',
            'Das aktualisieren ihrer Daten ist fehlgeschlagen!'
          );
        }
      );
  }

  async fetch() {
    this.apollo
      .watchQuery<any>({
        query: queryExamResults,
        fetchPolicy: 'no-cache',
      })
      .valueChanges.subscribe(
        (response) => {
          this.examResultsArray = response.data.getAllExamResults;
          this.examResultsArray.forEach((ele) => {
            ele.date = normalizeDate(ele.date);
          });
          this._examResults.next(this.examResultsArray);
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            'Server Fehler!',
            'Beim lesen der Prüfungsergebnisse ist ein Fehler aufgetreten!'
          );
        }
      );
  }
}
