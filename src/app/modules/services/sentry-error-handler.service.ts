import * as Sentry from '@sentry/browser';
import { Injectable, ErrorHandler } from '@angular/core';
import { environment } from '../../../environments/environment';

Sentry.init({
  dsn: environment.sentryApiKey,
  maxBreadcrumbs: 50,

  // Before event send to santry
  beforeSend: (event) => {
    // Do Stuff, before the event gets send
    // ...
    // Returning null does not send the event
    console.log(event);
    return environment.production ? event : null;
  },
});

@Injectable({
  providedIn: 'root',
})
export class SentryErrorHandler implements ErrorHandler {
  protected disabled = !environment.production;
  protected disabledTime = 60 * 1000;

  constructor() {
    // Enable this to set user information
    /* Sentry.configureScope(scope => {
        scope.setUser({
          id: user.id,
          username: user.name,
          email: user.mail,
        })
      }) */
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
