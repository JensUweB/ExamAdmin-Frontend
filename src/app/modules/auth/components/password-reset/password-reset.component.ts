import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/modules/user/user.service';
import { GraphQLService } from 'src/app/modules/core/graphql/services/graphql.service';
import { ToastService } from 'src/app/modules/core/services/toast.service';
import { subscribe } from 'graphql';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
  ) {
    this.token = this.route.snapshot.paramMap.get('token');
    localStorage.setItem('token', this.token);
  }

  get password() {
    return this.pwForm.get('password');
  }
  get password2() {
    return this.pwForm.get('password2');
  }
  token;
  public pwForm: FormGroup;
abcdefg;

  ngOnInit(): void {
    this.pwForm = this.fb.group({
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }
  async setPassword() {
    if (this.pwForm.valid && this.password.value === this.password2.value) {
      this.userService.setUserPassword(this.password.value);
    } else {
      this.toastService.error('Eingabe fehlerhaft!', 'Bitte das neue Passwort in beide Felder eintragen!');
    }
  }

}
