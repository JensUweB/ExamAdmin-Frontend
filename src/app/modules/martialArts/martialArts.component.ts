import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { MartialArtsService } from './martialArts.service';
import { MartialArt } from '../models/martialArt.model';
import { Subscription } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-martial-art',
  templateUrl: './martialArts.component.html',
  styleUrls: ['./martialArts.component.scss']
})
export class MartialArtsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  private userSubscription: Subscription;
  user: User;
  martialArts: MartialArt[];
  isLoaded = false;
  canEdit = false;

  constructor(
    public maService: MartialArtsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  async ngOnInit() {
    this.userSubscription = this.authService.user.subscribe(data => {
      this.user = data;
    });
    await this.maService.fetch();
    this.subscription = this.maService.martialArts
    .subscribe(data => {
      this.martialArts = data;
      if (data.length) {
        this.isLoaded = true;
        // Check for each martial art if user is allowed to change it
        this.martialArts.forEach(ma => ma.canEdit = ma.examiners.some(item => item._id === this.user._id));
      }
      if (!environment.production) { console.log('[MAComponent] Data fetched!'); }
    });
  }



  showDetails(ma) {
    this.maService.setCurrent(ma, false);
    this.router.navigate(['/martialArt-details']);
  }

  showEdit(ma) {
    this.maService.setCurrent(ma, true);
    this.router.navigate(['/martialArt-details']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  isValidString(str: string) {
    return str.length > 250;
  }
}
