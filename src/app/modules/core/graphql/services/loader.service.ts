import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = new BehaviorSubject(false);

  constructor() {}

  public start() {
    this.isLoading.next(true);
  }

  public stop() {
    this.isLoading.next(false);
  }

  public getAsObservable(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
}
