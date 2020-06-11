import * as Sentry from '@sentry/browser';
import { Injectable, ErrorHandler, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

Sentry.init({
  dsn: environment.sentryApiKey,
  maxBreadcrumbs: 50,

  // Before event send to santry
  beforeSend: (event) => {
    // Do Stuff, before the event gets send
    // ...
    // Returning null does not send the event
    return environment.production ? event : null;
  },
});

@Injectable({
  providedIn: 'root',
})
export class SentryErrorHandler implements ErrorHandler, OnInit, OnDestroy {
  protected disabled = !environment.production;
  protected disabledTime = 60 * 1000;
  private user;
  private userSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(data => {
      this.user = data;
      if(this.user) {
        Sentry.configureScope(scope => {
          scope.setUser({
            id: data._id,
            email: data.email,
          });
        });
      }
    });
  }

  ngOnDestroy() {
    if(this.userSub) { this.userSub.unsubscribe(); }
  }

  /**
   * Internal handling
   */
  handleError(error) {
    if (environment.production && !this.disabled) {
      this.disabled = true;
      const eventId = Sentry.captureException(error.originalError || error);
      Sentry.showReportDialog({ eventId });
      setTimeout(() => {
        this.disabled = false;
      }, this.disabledTime);
    }
  }
}
