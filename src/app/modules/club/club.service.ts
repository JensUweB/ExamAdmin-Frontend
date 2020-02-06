import { OnInit, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';

const clubQuery = gql`{getAllClubs{_id, name}}`;

@Injectable()
export class ClubService implements OnInit {

    private querySubscription: Subscription;
    clubs;

    constructor(private apollo: Apollo) {
        this.querySubscription = this.apollo.watchQuery<any>({
            query: clubQuery,
            fetchPolicy: 'no-cache'
        }).valueChanges.subscribe((response) => {
            if (response.data) {
                this.clubs = response.data.getAllClubs;
            }
        }, (err) => { console.warn('[ExamService]: GraphQL Error:', err.graphQLErrors[0].message); });
    }
    ngOnInit() { }
}