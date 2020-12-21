import { Component, OnInit, OnDestroy, HostBinding, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { version } from '../../../../package.json';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

export interface DialogData {
  username: string;
  email: string;
  text: string;
}

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit, OnDestroy {
  // get the app version string
  public version: string = version;
  public theme: 'theme-light';
  helpHover = false;
  settingsHover = false;
  user;
  userSub;
  @HostBinding('class') componentCssClass;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
    isAuthenticated = false;
    authSub: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private overlayContainer: OverlayContainer,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authSub = this.authService.isAuthenticatedBS.subscribe(ele => {
      this.isAuthenticated = !!ele;
    });
    this.userSub = this.authService.user.subscribe(data => this.user = data);
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      width: '250px',
      data: {
        username: this.user.firstName + ' ' + this.user.lastName,
        email: this.user.email
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Do stuff after dialog was closed
    });
  }

  onLogout() {
    this.authService.logout();
  }

  onThemeChange(theme) {
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
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

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: 'feedback-dialog.html',
})
export class FeedbackDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
