import { OnInit, Injectable, Output, EventEmitter } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { MartialArt } from '../models/martialArt.model';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { isArray } from 'util';
import { logError } from '../helpers/error.helpers';

const maQuery = gql`{getAllMartialArts{_id, name, styleName, description, examiners{_id, firstName, lastName, martialArts{_id{_id, ranks{name}},rankId}}, ranks{_id, name, number}}}`;

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
          this.fetch();
    }

    printError(err) {
      logError('[UserComponent]',err);
      //this.alerts.push({type: 'danger', message: getGraphQLError(err)});
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
            if(Array.isArray(examiner.martialArts)) {
              examiner.martialArts = examiner.martialArts.filter(ele => ele._id._id == ma._id.toString());
              if(examiner.martialArts[0]) {
                examiner.martialArts = {...ma.ranks.filter(rank => rank._id == examiner.martialArts[0].rankId)[0]};
              }
            }
          });
        });
        console.log('[MAService] Got some data!');
        this.maArray = data;
        this._martialArts.next(data);
      }, (err) => {
        this.printError(err);
      });
    }

    // ngOnInit does not work at all
    ngOnInit() {
      this.fetch(); 
    }

    setCurrent(ma: MartialArt, editMode: Boolean) {
      this.martialArt = this.maArray.filter(item => item._id == ma._id)[0];
      this.editMode = editMode;
    }
}