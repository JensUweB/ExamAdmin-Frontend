import { Injectable } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { User } from "../classes/user.class";
import { Alert } from "../../types/Alert";
import { getStatusCode } from "../../shared/helpers/error.helpers";
import { ExamService } from "../../library/exam/exam.service";
import { MartialArtsService } from "../../library/martialArts/martialArts.service";
import { GraphQLService } from "../../core/graphql/services/graphql.service";
import { ToastService } from "../../core/services/toast.service";
import { Helper } from "../classes/helper.class";

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

@Injectable({ providedIn: "root" })
export class AuthService {
  // private properties
  private userBS: BehaviorSubject<User> = new BehaviorSubject(null);

  // public properties
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
        $localize`Login failed!`,
        $localize`Email or password incorrect!`,
        8000
      );
    } else {
      this.toastService.error(
        Helper.locales.serverErrorTitle,
        $localize`Login failed, but we don't know why!`
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
        fetchPolicy: "no-cache",
      })
      .valueChanges.subscribe(
        (response) => {
          if (response.data) {
            this.toastService.success(
              "Login",
              $localize`Your login was successfull!`
            );
            this.userBS.next(response.data.login.user);
            this.token = response.data.login.token;
            this.tokenExpireDate = response.data.login.tokenExpireDate;
            this.isAuthenticatedBS.next(true);
            localStorage.setItem("token", this.token);
            localStorage.setItem(
              "tokenExpDate",
              this.tokenExpireDate.toString()
            );
            this.maService.fetch();
            this.examService.fetchExams();
            this.router.navigate(["/"]);
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
    if (localStorage.getItem("token")) {
      this.token = localStorage.getItem("token");
      this.apollo
        .watchQuery<any>({
          query: getUser,
          fetchPolicy: "no-cache",
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
    localStorage.setItem("token", null);
    this.router.navigate(["/"]);
    this.toastService.success(`Logout`, $localize`Logout successfull.`);
  }

  signup(firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return new Observable((subscriber) => {
      this.apollo
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
          if (response.data) {
            if (response.data.signup === 'ACCOUNT_CREATED') {
              this.toastService.success(
                $localize`Account created`,
                $localize`You can now login to your account!`,
                6000
              );
            } 
            if (response.data.signup === 'ACCOUNT_CONFIRM') {
              this.toastService.success(
                $localize`Signup successfull!`,
                $localize`Please check your emails to complete signup!`,
                6000
              );
            }
            subscriber.next(response.data);
            subscriber.complete();
          }
          if (response.errors) {
            console.error(response.errors[0]);
            this.toastService.error(
              Helper.locales.serverErrorTitle,
              $localize`An unexpected server error occured!`
            );
            subscriber.error(response.errors);
            subscriber.complete();
          }
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            Helper.locales.serverErrorTitle,
            $localize`An unexpected server error occured!`
          );
          subscriber.error(err);
          subscriber.complete();
        }
      );
    })
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
      $localize`Passwort Reset`,
      $localize`An confirmation email will be send, if this account exists`,
      6000
    );
  }
}
