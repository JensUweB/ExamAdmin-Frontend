import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Alert } from '../types/Alert';
import { getStatusCode } from '../helpers/error.helpers';
import { ExamService } from '../exam/exam.service';
import { MartialArtsService } from '../martialArts/martialArts.service';
import { GraphQLService } from '../core/graphql/services/graphql.service';
import { ToastService } from '../core/services/toast.service';

const signUp = gql`
  mutation signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    signup(
      userInput: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
      }
    )
  }
`;

const login = gql`
  query login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      tokenExpireDate
      user {
        _id
        firstName
        lastName
        email
        martialArts {
          _id {
            _id
            name
            styleName
            examiners {
              _id
            }
            ranks {
              name
              number
            }
          }
          rankId
        }
        clubs {
          club {
            _id
            name
          }
        }
      }
    }
  }
`;

const getUser = gql`
  {
    getUser {
      _id
      firstName
      lastName
      email
      martialArts {
        _id {
          _id
          name
          styleName
          examiners {
            _id
          }
          ranks {
            name
            number
          }
        }
        rankId
      }
      clubs {
        club {
          _id
          name
        }
      }
    }
  }
`;

const pwReset = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userBS: BehaviorSubject<User> = new BehaviorSubject(null);
  public readonly user = this.userBS.asObservable();
  token: string;
  tokenExpireDate: Date;
  alerts: Alert[] = [];

  public isAuthenticatedBS = new BehaviorSubject(false);

  constructor(
    private apollo: Apollo,
    private router: Router,
    private toastService: ToastService,
    private examService: ExamService,
    private maService: MartialArtsService,
    private graphQlService: GraphQLService
  ) {}

  loginError(err) {
    if (getStatusCode(err) === 401) {
      this.toastService.error(
        'Login Fehlgeschlagen!',
        'E-Mail oder Paswort nicht korrekt!',
        8000
      );
    } else {
      this.toastService.error(
        'Server Fehler!',
        'Es ist ein Server Fehler aufgetreten!'
      );
    }
  }

  async login(email: string, password: string): Promise<any> {
    await this.apollo
      .watchQuery<any>({
        query: login,
        variables: {
          email,
          password,
        },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.subscribe(
        (response) => {
          if (response.data) {
            this.toastService.success('Login', 'Login erfolgreich!');
            this.userBS.next(response.data.login.user);
            this.token = response.data.login.token;
            this.tokenExpireDate = response.data.login.tokenExpireDate;
            this.isAuthenticatedBS.next(true);
            localStorage.setItem('token', this.token);
            localStorage.setItem(
              'tokenExpDate',
              this.tokenExpireDate.toString()
            );
            this.maService.fetch();
            this.examService.fetchExams();
            this.router.navigate(['/']);
          }
          if (response.errors) {
            this.loginError(response.errors);
          }
        },
        (err) => {
          this.loginError(err);
        }
      );
  }

  async loadUser() {
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.apollo
        .watchQuery<any>({
          query: getUser,
          fetchPolicy: 'no-cache',
        })
        .valueChanges.subscribe(
          (response) => {
            if (response.data) {
              this.userBS.next(response.data.getUser);
              this.isAuthenticatedBS.next(true);
              this.maService.fetch();
              this.examService.fetchExams();
            }
          },
          (err) => {}
        );
    }
  }

  logout() {
    this.isAuthenticatedBS.next(false);
    this.userBS.next(null);
    this.token = null;
    this.tokenExpireDate = null;
    localStorage.setItem('token', null);
    this.router.navigate(['/']);
  }

  async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> {
    let result = false;
    await this.apollo
      .mutate<any>({
        mutation: signUp,
        variables: {
          firstName,
          lastName,
          email,
          password,
        },
      })
      .subscribe(
        (response) => {
          this.toastService.success(
            'Konto erstellt!',
            'Ein neues Benutzerkonto wurde erfolgreich erstellt!',
            6000
          );
          result = true;
        },
        (err) => {
          this.toastService.error(
            'Server Fehler!',
            'Es ist ein Server Fehler aufgetreten!'
          );
          console.error(err);
        }
      );
    return result;
  }

  async resetPassword(email: string) {
    this.apollo
      .mutate<any>({
        mutation: pwReset,
        variables: {
          email,
        },
      })
      .subscribe(
        (response) => {},
        (err) => {}
      );
    this.toastService.info(
      'Passwort Reset',
      'Falls ein Konto mit dieser E-Mail existiert, wurde das Passwort zurückgesetzt.',
      6000
    );
  }
}
