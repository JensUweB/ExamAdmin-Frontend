import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  // Push new Toasts to array with content and options
  show(content: any, options: any = {}) {
    this.toasts.push({ content, ...options });
  }

  // Callback method to remove Toast DOM element from view
  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  savedSuccessfull() {
    this.show({
      headline: 'Erfolgreich!',
      description: 'Das Speichern war erfolgreich!',
      autohide: true,
      type: 'success',
    });
  }

  success(title: string, description?: string) {
    this.show({
      headline: title ? title : 'Erfolgreich!',
      description: description ? description : '',
      autohide: true,
      type: 'success',
    });
  }

  info(title: string, description?: string) {
    this.show({
      headline: title ? title : 'Info!',
      description: description ? description : '',
      autohide: true,
      type: 'info',
    });
  }

  error(title: string, description?: string) {
    this.show({
      headline: title ? title : 'Error!',
      description: description ? description : '',
      autohide: true,
      type: 'error',
    });
  }

  savedFailed() {
    this.show(
      {
        headline: 'Fehlgeschlagen!',
        description: 'Beim Speichern ist etwas schiefgelaufen. Bitte probieren Sie es später erneut.',
        type: 'error',
      },
      {
        classname: 'bg-danger',
        autohide: true,
      }
    );
  }
}
