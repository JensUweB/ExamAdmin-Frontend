import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private userForm: FormGroup;

  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    // Setup the form
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required ], //Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
      login: true
    });
  }

  async confirm() {
    if (this.userForm.valid) {
      if (this.login.value) {
        this.authService.login(this.email.value, this.password.value);
        this.router.navigate(['/']);
      } else {
        this.authService.signup(this.firstName.value, this.lastName.value, this.email.value, this.password.value);
      }
    } else {
    }
  }

  /**
   * Form Field Getters
   */
  get email() {
    return this.userForm.get('email');
  }
  get firstName() {
    return this.userForm.get('firstName')
  }
  get lastName() {
    return this.userForm.get('lastName');
  }
  get password() {
    return this.userForm.get('password');
  }
  get login() {
    return this.userForm.get('login');
  }
}
