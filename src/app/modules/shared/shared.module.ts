import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { NgbToast, NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [ToastComponent],
  imports: [
    CommonModule,
    NgbModule,
    NgbToast
  ],
  exports: [
    ToastComponent
  ]
})
export class SharedModule { }
