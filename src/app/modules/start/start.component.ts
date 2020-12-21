import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  user;

  constructor(
    private authService: AuthService,
  ) {
    this.userSub = this.authService.user.subscribe(data => this.user = data);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
