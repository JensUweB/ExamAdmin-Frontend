import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import { MartialArtsService } from './martialArts.service';


@Component({
  selector: 'app-martial-art',
  templateUrl: './martialArts.component.html',
  styleUrls: ['./martialArts.component.scss']
})
export class MartialArtsComponent implements OnInit {
  martialArts;

  constructor(
    private maService: MartialArtsService
  ) {
    this.martialArts = this.maService.getMartialArts();
    console.log('[MAComp] Data fetched!');
  }

  ngOnInit() {
    
  }
}
