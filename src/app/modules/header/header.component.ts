import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{
  private userSub: Subscription;
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userSub = this.authService._isAuthenticated.subscribe(ele => {
      this.isAuthenticated = !ele ? false : true; //instead you could write = !!user
    });
    //if(localStorage.getItem('token')) this.isAuthenticated = true;
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onSaveData() {
    
  }

  onFetchData() {
    
  }

  onLogout() {
    this.authService.logout();
  }


}
