import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartComponent } from './modules/start/start.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent, FeedbackDialogComponent } from './modules/main-nav/main-nav.component';
import { MaterialModule } from './material-module';
import { SentryErrorHandler } from './modules/core/services/sentry-error-handler.service';
import { SharedModule } from './modules/shared/shared.module';
import { LibraryModule } from './modules/library/library.module';
import { CoreModule } from './modules/core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    MainNavComponent,
    FeedbackDialogComponent,
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
