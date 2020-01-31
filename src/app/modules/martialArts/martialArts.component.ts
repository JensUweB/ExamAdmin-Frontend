import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import gql from 'graphql-tag';

const maQuery = gql`{getAllMartialArts{_id, name, styleName, examiners{firstName, lastName, martialArts{_id, rankName}}}}`;

@Component({
  selector: 'app-martial-art',
  templateUrl: './martialArts.component.html',
  styleUrls: ['./martialArts.component.scss']
})
export class MartialArtsComponent implements OnInit {
  private martialArts: any[];

  constructor(
    private apollo: Apollo, 
    private router: Router) {}

    ngOnInit() {
      this.apollo.watchQuery<any>({
        query: maQuery
      }).valueChanges.subscribe((response) => { 
        this.martialArts = response.data.getAllMartialArts;
        console.log('[MaComp] Got the following data: ',this.martialArts);

        this.martialArts.forEach(ma => {
          ma.examiners.forEach(examiner => {
            console.log('Whats happening?');
            const result = examiner.martialArts.filter(ele => ele._id.toString() != ma._id.toString());
            if(result.length) examiner.martialArts = result;
          });
        });

      }, (err) => {console.log('GraphQL error: ',JSON.stringify(err.graphQLErrors[0].message))});
    }
}
