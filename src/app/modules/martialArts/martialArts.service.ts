import { OnInit, Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';

const maQuery = gql`{getAllMartialArts{_id, name, styleName, description, examiners{firstName, lastName, martialArts{_id, rankName}}, ranks{name, number}}}`;

@Injectable()
export class MartialArtsService implements OnInit {
    private martialArts: any[];
    
    constructor(
        private apollo: Apollo, 
        private router: Router) {
        this.apollo.watchQuery<any>({
            query: maQuery,
            fetchPolicy: 'no-cache'
          }).valueChanges.subscribe((response) => { 
            this.martialArts = response.data.getAllMartialArts;
            console.log('[MAService] Got some data!');
    
            this.martialArts.forEach(ma => {
              ma.isHidden = true;
              ma.examiners.forEach(examiner => {
                let result = examiner.martialArts.filter(ele => ele._id.toString() != ma._id.toString());
                if(result.length) examiner.martialArts = result;
              });
            });
    
          }, (err) => {console.warn('[MAService] GraphQL error: ',err.graphQLErrors[0].message)});
    }
    ngOnInit() {}

    getMartialArts() {
        return this.martialArts;
    }
}