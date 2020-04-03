import { Component, OnInit } from '@angular/core';
import { MartialArt } from '../../models/martialArt.model';
import { MartialArtsService } from '../martialArts.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-martialart-details',
  templateUrl: './martialart-details.component.html',
  styleUrls: ['./martialart-details.component.css']
})
export class MartialartDetailsComponent implements OnInit {
  ma: MartialArt;
  editMode: Boolean;

  constructor(
    private maService: MartialArtsService
  ) {
    this.ma = maService.martialArt;
    this.editMode = maService.editMode;
   }

  ngOnInit(): void {
  }

}
