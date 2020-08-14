import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { MartialArt } from '../../core/classes/martialArt.class';
import { Subject, BehaviorSubject } from 'rxjs';
import { logError } from '../../shared/helpers/error.helpers';
import { ToastService } from '../../core/services/toast.service';

const maQuery = gql`{getAllMartialArts{_id, name, styleName, description,
  examiners{_id, firstName, lastName, martialArts{_id{_id, ranks{name}},rankId}},
  ranks{_id, name, number}}}`;

@Injectable()
export class MartialArtsService {
    private _martialArts: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private maArray = [];
    public readonly martialArts = this._martialArts.asObservable();
    martialArt: MartialArt;
    editMode: boolean;
    hasUpdated = new Subject();

    constructor(
      private apollo: Apollo,
      private router: Router,
      private toastService: ToastService,
    ) {}

    printError(err) {
      console.error(err);
      this.toastService.error('Server Fehler!',err);
    }

    async fetch() {
      await this.apollo.watchQuery<any>({
        query: maQuery,
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response) => {
        const data = response.data.getAllMartialArts;
        data.forEach(ma => {
          ma.isHidden = true;
          ma.examiners.forEach(examiner => {
            if (Array.isArray(examiner.martialArts)) {
              examiner.martialArts = examiner.martialArts.filter(ele => ele._id._id === ma._id.toString());
              if (examiner.martialArts[0]) {
                examiner.martialArts = {...ma.ranks.filter(rank => rank._id === examiner.martialArts[0].rankId)[0]};
              }
            }
          });
        });
        this.maArray = data;
        this._martialArts.next(data);
      }, (err) => {
        this.printError(err);
      });
    }

    setCurrent(ma: MartialArt, editMode: boolean) {
      this.martialArt = this.maArray.filter(item => item._id === ma._id)[0];
      this.editMode = editMode;
    }
}
