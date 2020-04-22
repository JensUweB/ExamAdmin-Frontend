import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { MartialArtsService } from './martialArts.service';
import { MartialArt } from '../models/martialArt.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-martial-art',
  templateUrl: './martialArts.component.html',
  styleUrls: ['./martialArts.component.scss']
})
export class MartialArtsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  martialArts: MartialArt[];
  isLoaded = false;

  constructor(
    public maService: MartialArtsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  async ngOnInit() {
    await this.maService.fetch();
    this.subscription = this.maService.martialArts
    .subscribe(data => { 
      this.martialArts = data;
      if(data.length) this.isLoaded = true;
      console.log('[MAComponent] Data fetched!');
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
  }
}
