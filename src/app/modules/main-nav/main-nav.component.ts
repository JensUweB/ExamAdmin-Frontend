import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit, OnDestroy{
  // get the app version string
  public version: string = version;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
    isAuthenticated = false;
    userSub: Subscription;

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userSub = this.authService._isAuthenticated.subscribe(ele => {
      this.isAuthenticated = !!ele;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }

  addExam() {
    this.router.navigate(['/new-exams']);
  }

  addExamResult() {
    this.router.navigate(['/exam-results']);
  }

  addMA() {
    this.router.navigate(['/new-martialArt']);
  }

  addClub() {
    this.router.navigate(['/']);
  }
}
