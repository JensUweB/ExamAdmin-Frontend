import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../types/Alert';
import { ToastService } from '../core/services/toast.service';


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
      password: [''], // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
    });
  }

  async confirm() {
    if (this.userForm.valid) {
      if (this.login) {
        this.authService.login(this.email.value, this.password.value);

      } else {
        const result = await this.authService.signup(this.firstName.value, this.lastName.value, this.email.value, this.password.value);
        if (result) { this.disableSignup = true; }
      }
    }
  }

  async resetPassword() {
    this.authService.resetPassword(this.email.value);
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
