import { Component, HostBinding } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  @HostBinding('class.ngb-toasts') toasts = true;

  constructor(public toastService: ToastService) {}
}
