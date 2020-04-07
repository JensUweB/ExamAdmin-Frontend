import { OnInit, Injectable, Output, EventEmitter } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { MartialArt } from '../models/martialArt.model';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';

const maQuery = gql`{getAllMartialArts{_id, name, styleName, description, examiners{_id, firstName, lastName, martialArts{_id{_id, ranks{name}}}}, ranks{_id, name, number}}}`;

@Injectable()
export class MartialArtsService implements OnInit {
    private _martialArts: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private maArray = [];
    public readonly martialArts = this._martialArts.asObservable();
    martialArt: MartialArt;
    editMode: Boolean;
    hasUpdated = new Subject();
    
    constructor(
        private apollo: Apollo, 
        private router: Router) {
    }

    fetch() {
      this.apollo.watchQuery<any>({
        query: maQuery,
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response) => { 
        let data = response.data.getAllMartialArts;
        data.forEach(ma => {
          ma.isHidden = true;
          ma.examiners.forEach(examiner => {
            examiner.martialArts = examiner.martialArts.filter(ele => ele._id.toString() == ma._id.toString());
          });
        });
        console.log('[MAService] Got some data!');
        this.maArray = data;
        this._martialArts.next(data);
      }, (err) => {
        console.error('[MAService] ',err);
      });
    }

    ngOnInit() {
      this.fetch();
    }

    setCurrent(ma: MartialArt, editMode: Boolean) {
      this.martialArt = this.maArray.filter(item => item._id == ma._id)[0];
      this.editMode = editMode;
    }
}