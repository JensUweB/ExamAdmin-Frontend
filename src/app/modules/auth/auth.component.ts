import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../types/Alert';
import { ToastService } from '../core/services/toast.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private apollo: Apollo) { }

  ngOnInit() {
    // Setup the form
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)] ], // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
    });
  }

  async confirm() {
    if (this.userForm.valid) {
      if (this.login) {
        this.authService.login(this.email.value, this.password.value);

      } else {
        // this.authService.signup(this.firstName.value, this.lastName.value, this.email.value, this.password.value);
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
          this.toastService.success('Konto erstellt!', 'Ein neues Benutzerkonto wurde erfolgreich erstellt!', 6000);
        }, (err) => {
          this.toastService.error('Server Fehler!','Es ist ein Server Fehler aufgetreten!');
          console.error(err);
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
