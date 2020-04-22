import { Injectable, OnDestroy, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Subscription, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Alert } from '../types/Alert';
import { logError, getGraphQLError } from '../helpers/error.helpers';
import { ExamService } from '../exam/exam.service';
import { MartialArtsService } from '../martialArts/martialArts.service';

const login = gql`
query login($email: String!, $password: String!)
{login(email: $email, password: $password)
{token, tokenExpireDate, user{_id, firstName, lastName, email, martialArts{_id{_id, name, styleName, examiners{_id}, ranks{name, number}}, 
                        rankId}, clubs{club{_id,name}}}}}`;

const getUser = gql`{getUser{_id, firstName, lastName, email, martialArts{_id{_id, name, styleName, examiners{_id}, ranks{name, number}}, 
                        rankId}, clubs{club{_id,name}}}}`;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit, OnDestroy{
    private _user: BehaviorSubject<User> = new BehaviorSubject(null);    
    public readonly user = this._user.asObservable();
    token: string;
    tokenExpireDate: Date;
    alerts: Alert[] = [];

    public _isAuthenticated = new BehaviorSubject(false);

    constructor(
        private apollo: Apollo, 
        private router: Router,
        private examService: ExamService,
        private maService: MartialArtsService
    ) {}

    ngOnInit() {
        
    }

    printError(err) {
      logError('[UserComponent]',err);
      this.alerts.push({type: 'danger', message: getGraphQLError(err)});
    }

    async login(email: string, password: string): Promise<any> {
        let returnCode: number;
        let error;
        console.log('[AuthService] Logging in...');
        await this.apollo.watchQuery<any>({
            query: login,
            variables: {
                email: email, 
                password: password
            },
            fetchPolicy: 'no-cache'
          }).valueChanges.subscribe((response) => {
            if(response.data){
                console.log('[AuthService] Success! Got some data!');
                this._user.next(response.data.login.user);
                this.token = response.data.login.token;
                this.tokenExpireDate = response.data.login.tokenExpireDate;
                this._isAuthenticated.next(true);
                localStorage.setItem('token',this.token);
                localStorage.setItem('tokenExpDate',this.tokenExpireDate.toString());
                this.maService.fetch();
                this.examService.fetchExams();
                this.router.navigate(['/']);
            } 
            if(response.errors) {
                this.alerts.push({type: 'danger', message: response.errors[0].message})
                throw response.errors;
            }
        }, (err) => {
            this.printError(err);
        });
    }

    async loadUser() {
        if(localStorage.getItem('token')){
            this.token = localStorage.getItem('token');
            console.log('[AuthService] Loading user data...');
            this.apollo.watchQuery<any>({
                query: getUser,
                fetchPolicy: 'no-cache'
              }).valueChanges.subscribe((response) => {
                if(response.data){
                    console.log('[AuthService] Success! Got some data!');
                    this._user.next(response.data.getUser);
                    this._isAuthenticated.next(true);
                    this.maService.fetch();
                    this.examService.fetchExams();
                }
            }, (err) => {
                this.printError(err);
            });
        }
    }

    logout() {
        this._isAuthenticated.next(false);
        this._user.next(null);
        this.token = null;
        this.tokenExpireDate = null;
        localStorage.setItem('token',null);
        this.router.navigate(['/']);
    }

    signup(firstName: string, lastName: string, email: string, password: string): boolean {
        throw new Error("Method not implemented.");
    }

    ngOnDestroy() {
        
    }

}