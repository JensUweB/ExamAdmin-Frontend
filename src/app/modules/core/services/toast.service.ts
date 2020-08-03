import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  /**
   * Push new Toasts to array with content and options
   * @param content the content of the toast (e.g. title, description)
   * @param options the options object of the toast (e.g. delay, type)
   */
  show(content: any, options: any = {}) {
    this.toasts.push({ content, ...options });
  }

  /**
   * Callback method to remove Toast DOM element from view
   * @param toast the toast object to remove
   */
  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  /**
   * Creates a success toast with a green bar
   * @param title The title of the toast
   * @param description The description of the toast
   * @param delay The delay in milliseconds before the toast gets hidden
   */
  success(title: string, description?: string, delay?: number) {
    this.show({
      headline: title ? title : 'Erfolgreich!',
      description: description ? description : '',
      autohide: true,
      delay,
      type: 'success',
    });
  }

  /**
   * Creates a info toast with a blue bar
   * @param title The title of the toast
   * @param description The description of the toast
   * @param delay The delay in milliseconds before the toast gets hidden
   */
  info(title: string, description?: string, delay?: number) {
    this.show({
      headline: title ? title : 'Info!',
      description: description ? description : '',
      autohide: true,
      delay,
      type: 'info',
    });
  }

  /**
   * Creates a error toast with a red bar
   * @param title The title of the toast
   * @param description The description of the toast
   * @param delay The delay in milliseconds before the toast gets hidden
   */
  error(title: string, description?: string, delay?: number) {
    this.show({
      headline: title ? title : 'Error!',
      description: description ? description : '',
      autohide: true,
      delay,
      type: 'error',
    });
  }
}
