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
  isAuthenticated = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    /* this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !user ? false : true; //instead you could write = !!user
    }); */
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
