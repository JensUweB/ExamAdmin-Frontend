import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../types/Alert';
import { logError, getGraphQLError } from '../helpers/error.helpers';
import { environment } from 'src/environments/environment';

const signUp = gql`mutation signup($firstName: String!, $lastName: String!, $email: String!, $password: String!){
  signup(userInput: {firstName: $firstName, lastName: $lastName, email: $email, password: $password})}`;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  userForm: FormGroup;
  login = true;
  alerts: Alert[] = [];
  disableSignup = false;

  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder, private apollo: Apollo) { }

  ngOnInit() {
    // Setup the form
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required ], // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
    });
  }

  printError(err) {
    logError('[UserComponent]', err);
    this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  async confirm() {
    if (this.userForm.valid) {
      if (this.login) {

        try {
          await this.authService.login(this.email.value, this.password.value);
        } catch (err) { this.printError(err); }

      } else {
        // this.authService.signup(this.firstName.value, this.lastName.value, this.email.value, this.password.value);
        if (!environment.production) { console.log('[Auth] Sending account creation request...'); }
        this.apollo.mutate<any>({
          mutation: signUp,
          variables: {
            firstName: this.firstName.value,
            lastName: this.lastName.value,
            email: this.email.value,
            password: this.password.value
          }
        }).subscribe((response) => {
          this.disableSignup = true;
          this.alerts.push({type: 'success', message: 'Success! You should receive an confirmation email!'});
          if (!environment.production) { console.log('[Auth] Success! You should receive an confirmation email!'); }
        }, (err) => {
          this.printError(err);
        });
      }
    }
  }

  /**
   * Form Field Getters
   */
  get email() {
    return this.userForm.get('email');
  }
  get firstName() {
    return this.userForm.get('firstName');
  }
  get lastName() {
    return this.userForm.get('lastName');
  }
  get password() {
    return this.userForm.get('password');
  }
  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert));
  }
}
