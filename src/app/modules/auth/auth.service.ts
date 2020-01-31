import { Injectable, OnDestroy } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

const login = gql`
query login($email: String!, $password: String!)
{login(email: $email, password: $password)
{token, tokenExpireDate, user{_id, firstName,lastName, email, martialArts{name, styleName, ranks{name, number}}, clubs{club{name}}}}}`;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy{
    private querySubscription: Subscription;
    user: any;
    token: string;
    tokenExpireDate: Date;

    public _isAuthenticated = new BehaviorSubject(false);

    constructor(private apollo: Apollo, private router: Router) {}

    async login(email: string, password: string): Promise<any> {
        let user;
        let error;
        console.log('Logging in...');
        this.querySubscription = this.apollo.watchQuery<any>({
            query: login,
            variables: {
                email: email, 
                password: password
            }
          }).valueChanges.subscribe((response) => {
            if(response.data){
                console.log('Success! Got some data!');
                this.user = response.data.login.user;
                this.token = response.data.login.token;
                this.tokenExpireDate = response.data.login.tokenExpireDate;
                this._isAuthenticated.next(true);
                localStorage.setItem('token',this.token);
                localStorage.setItem('tokenExpDate',this.tokenExpireDate.toDateString());
                this.router.navigate(['/']);
            }
        }, (err) => {error = err;});

        if(error) return false;
        return true;
    }

    logout() {
        this._isAuthenticated.next(false);
        this.user = null;
        this.token = null;
        this.tokenExpireDate = null;
    }

    signup() {
        throw new Error("Method not implemented.");
    }

    ngOnDestroy() {
        this.querySubscription.unsubscribe();
    }

}