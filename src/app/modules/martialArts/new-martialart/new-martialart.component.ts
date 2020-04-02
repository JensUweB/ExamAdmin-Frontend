import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Alert } from '../../types/Alert';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../auth/auth.service';
import { MartialArtsService } from '../martialArts.service';
import { MartialArtsComponent } from '../martialArts.component';

const newMA = gql`mutation createMartialArt($name: String!, $styleName: String!, $description: String!, $ranks: [RankInput!], $userId: String!)
{createMartialArt(input: {
  	name: $name
    styleName: $styleName
    description: $description
    ranks: $ranks
  examiners: [$userId]
  }){_id}}`;

@Component({
  selector: 'app-new-martialart',
  templateUrl: './new-martialart.component.html',
  styleUrls: ['./new-martialart.component.css']
})
export class NewMartialartComponent implements OnInit {

  form: FormGroup;
  alerts: Alert[] = [];
  showRanks = false;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private authService: AuthService,
    private maService: MartialArtsService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      styleName: ['', Validators.required],
      description: ['', Validators.required],
      ranks: this.fb.array([]),
      rankCount: [0]
    });
  }

  ngOnInit(): void {
  }

  addRankGroup(name: string, number: number) {
    return this.fb.group({
      name: [name, [Validators.required]],
      number: [number, [Validators.required, Validators.pattern("0-9")]]
    });
  }

  setupRanks() {
    const count: number = this.rankCount.value + 1;
    for(let i=0; i<count; i++) {
      if(i==0) {
        this.ranks.push(this.addRankGroup("none",count));
      } else {
        this.ranks.push(this.addRankGroup((count-i)+". rank",count-i));
      }
    }
    this.showRanks = true;
  }

  removeRank(index: number) {
    this.ranks.removeAt(index);
  }

  async onSubmit() {
    console.log('[NewMartialArtComp] Creating new martial art...');
    await this.apollo.mutate<any>({
      mutation: newMA,
      variables: {
        name: this.maName.value,
        styleName: this.styleName.value,
        description: this.description.value,
        ranks: this.ranks.value,
        userId: this.authService.user._id
      },
    }).subscribe(response => {
      if (response.data) {
        this.alerts.push({type:"success", message: 'New martial art was created!'});
        console.log('[NewMartialArtComp] Done.');
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[ExamResult] ', JSON.stringify(err));
    });
    this.maService.fetch();
  }

  get rankCount() {
    return this.form.get('rankCount');
  }

  get ranks() {
    return <FormArray>this.form.get('ranks');
  }

  get maName() {
    return <FormArray>this.form.get('name');
  }

  get styleName() {
    return <FormArray>this.form.get('styleName');
  }

  get description() {
    return this.form.get('description');
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert));
  }

}
