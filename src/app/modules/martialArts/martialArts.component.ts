import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { MartialArtsService } from './martialArts.service';
import { MartialArt } from '../models/martialArt.model';


@Component({
  selector: 'app-martial-art',
  templateUrl: './martialArts.component.html',
  styleUrls: ['./martialArts.component.scss']
})
export class MartialArtsComponent implements OnInit {
  martialArts: MartialArt[];

  constructor(
    private maService: MartialArtsService,
    private router: Router
  ) {
    this.martialArts = this.maService.martialArts;
    console.log('[MAComp] Data fetched!');
  }

  ngOnInit() {
  }

  showDetails(ma) {
    this.maService.setCurrent(ma, false);
    this.router.navigate(['/martialArt-details']);
  }

  showEdit(ma) {
    this.maService.setCurrent(ma, true);
    this.router.navigate(['/martialArt-details']);
  }
}
