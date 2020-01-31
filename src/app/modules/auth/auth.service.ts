import { Injectable, OnDestroy, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

const login = gql`
query login($email: String!, $password: String!)
{login(email: $email, password: $password)
{token, tokenExpireDate, user{_id, firstName,lastName, email, martialArts{_id, rankName, rankNumber}, clubs{club{name}}}}}`;

const getUser = gql`{getUser{_id, firstName, lastName, email, martialArts{_id, rankName, rankNumber}, clubs{club{name}}}}`;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit, OnDestroy{
    private querySubscription: Subscription;
    user: any;
    token: string;
    tokenExpireDate: Date;

    public _isAuthenticated = new BehaviorSubject(false);

    constructor(private apollo: Apollo, private router: Router) {}

    ngOnInit() {
        
    }

    async login(email: string, password: string): Promise<any> {
        let user;
        let error;
        console.log('[AuthService] Logging in...');
        this.querySubscription = this.apollo.watchQuery<any>({
            query: login,
            variables: {
                email: email, 
                password: password
            }
          }).valueChanges.subscribe((response) => {
            if(response.data){
                console.log('[AuthService] Success! Got some data!');
                this.user = response.data.login.user;
                this.token = response.data.login.token;
                this.tokenExpireDate = response.data.login.tokenExpireDate;
                this._isAuthenticated.next(true);
                localStorage.setItem('token',this.token);
                localStorage.setItem('tokenExpDate',this.tokenExpireDate.toString());
                this.router.navigate(['/']);
            }
        }, (err) => {
            console.log('[AuthService]',err);
        });

        if(error) return false;
        return true;
    }

    async loadUser() {
        if(localStorage.getItem('token')){
            console.log('[AuthService] Loading user data...');
            this.querySubscription = this.apollo.watchQuery<any>({
                query: getUser
              }).valueChanges.subscribe((response) => {
                if(response.data){
                    console.log('[AuthService] Success! Got some data!');
                    this.user = response.data.getUser;
                    this._isAuthenticated.next(true);
                    this.router.navigate(['/']);
                }
            }, (err) => {
                console.log('[AuthService]',err);
            });
        }
    }

    logout() {
        this._isAuthenticated.next(false);
        this.user = null;
        this.token = null;
        this.tokenExpireDate = null;
        localStorage.setItem('token',null);
    }

    signup() {
        throw new Error("Method not implemented.");
    }

    ngOnDestroy() {
        this.querySubscription.unsubscribe();
    }

}