import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit{
  title = 'Exam-Admin Frontend';

  login: boolean = true;
  email: string = 'tester@localhost';
  password: string = '123456';
  error: boolean;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    
  }

  async confirm() {
    if(this.email && this.password){
      this.error = false;
      if(this.login) {
          const result = this.authService.login(this.email, this.password);
          if(!result) this.error=true;
    } else {

    }} else {
      alert('email or password empty!');
    }
  }
}
