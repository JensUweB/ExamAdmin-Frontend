import { AuthService } from "../auth/auth.service";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Alert } from "../types/Alert";
import { Injectable } from '@angular/core';
import { getGraphQLError, logError } from '../helpers/error.helpers';

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
@Injectable()
export class UserService {
  alerts: Alert[] = [];

  constructor(private apollo: Apollo, private authService: AuthService) {}

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
}
