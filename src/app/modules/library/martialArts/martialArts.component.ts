import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MartialArtsService } from './martialArts.service';
import { MartialArt } from '../classes/martialArt.class';
import { Subscription } from 'rxjs';
import { User } from '../../core/classes/user.class';
import { AuthService } from '../../core/auth/auth.service';
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
  ) {
  }

  ngOnInit() {
    this.userSubscription = this.authService.user.subscribe(data => {
      this.user = data;
    });
    this.maService.fetch();
    this.subscription = this.maService.martialArts
    .subscribe(data => {
      this.martialArts = data;
      if (data.length) {
        this.isLoaded = true;
        // Check for each martial art if user is allowed to change it
        this.martialArts.forEach(ma => ma.canEdit = ma.examiners.some(item => item._id === this.user._id));
      }
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
