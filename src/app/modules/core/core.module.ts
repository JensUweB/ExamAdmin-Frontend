import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { GraphqlModule } from './graphql/graphql.module';
import { AuthService } from './auth/auth.service';
import { AuthComponent } from './auth/auth.component';
import { PasswordResetComponent } from './auth/components/password-reset/password-reset.component';
import { AuthGuard } from './auth/auth.guard';
import { SentryErrorHandler } from './services/sentry-error-handler.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from 'src/app/material-module';
import { UserModule } from './user/user.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    GraphqlModule,
    MaterialModule,
    UserModule,
  ],
  declarations: [
    AuthComponent,
    PasswordResetComponent,
  ],
  exports: [],
  providers: [
    ToastService,
    AuthService,
    AuthGuard,
    SentryErrorHandler,
  ]
})
export class CoreModule { }
