import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './modules/auth/auth.component';
import { UserComponent } from './modules/user/user.component';
import { StartComponent } from './modules/start/start.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UserService } from './modules/user/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent, FeedbackDialogComponent } from './modules/main-nav/main-nav.component';
import { MaterialModule } from './material-module';
import { SentryErrorHandler } from './modules/services/sentry-error-handler.service';
import { SharedModule } from './modules/shared/shared.module';
import { PasswordResetComponent } from './modules/auth/components/password-reset/password-reset.component';
import { LibraryModule } from './modules/library/library.module';
import { CoreModule } from './modules/core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    AuthComponent,
    UserComponent,
    MainNavComponent,
    FeedbackDialogComponent,
    PasswordResetComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: false /* environment.production */ }),
    CoreModule,
    SharedModule,
    LibraryModule,
  ],
  providers: [
    UserService,
    // Sends error report to sentry, if unhandled error occurs
    {
      provide: ErrorHandler,
      useClass: environment.production ? SentryErrorHandler : ErrorHandler,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
