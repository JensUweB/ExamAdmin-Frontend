import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Alert } from '../../types/Alert';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../auth/auth.service';
import { MartialArtsService } from '../martialArts.service';
import { MartialArt } from '../../models/martialArt.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

const newMA = gql`mutation createMartialArt($name: String!, $styleName: String!, $description: String!, $ranks: [RankInput!], $userId: String!)
{createMartialArt(input: {
  	name: $name
    styleName: $styleName
    description: $description
    ranks: $ranks
  examiners: [$userId]
  }){_id}}`;

  const updateMA = gql`mutation updateMartialArt($id: String!, $name: String!, $styleName: String!, $description: String!, $ranks: [RankInput!])
  {updateMartialArt(input: {
      name: $name
      styleName: $styleName
      description: $description
      ranks: $ranks
  }, id: $id){_id}}`;

@Component({
  selector: 'app-new-martialart',
  templateUrl: './new-martialart.component.html',
  styleUrls: ['./new-martialart.component.css']
})
export class NewMartialartComponent implements OnInit {

  @Input() ma: MartialArt;
  @Output() cancelEdit = new EventEmitter();
  form: FormGroup;
  alerts: Alert[] = [];
  showRanks = false;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private authService: AuthService,
    private maService: MartialArtsService,
    private router: Router,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    if(!this.ma) {
      this.form = this.fb.group({
        name: ['', Validators.required],
        styleName: ['', Validators.required],
        description: ['', Validators.required],
        ranks: this.fb.array([]),
        rankCount: [0]
      });
    } else {
      this.form = this.fb.group({
        name: [this.ma.name, Validators.required],
        styleName: [this.ma.styleName, Validators.required],
        description: [this.ma.description, Validators.required],
        ranks: this.fb.array([]),
        rankCount: [this.ma.ranks.length]
      });
      this.setupRanks();
    }
  }

  addRankGroup(name: string, number: number) {
    return this.fb.group({
      name: [name, [Validators.required]],
      number: [number, [Validators.required]]
    });
  }

  setupRanks() {
    if(!this.ma) {
      const count: number = this.rankCount.value + 1;
      for(let i=0; i<count; i++) {
        if(i==0) {
          this.ranks.push(this.addRankGroup("none",count));
        } else {
          this.ranks.push(this.addRankGroup((count-i)+". rank",count-i));
        }
      }
    } else {
      for(let i=0; i<this.ma.ranks.length; i++) {
        this.ranks.push(this.addRankGroup(this.ma.ranks[i].name,+this.ma.ranks[i].number));
      }
    }
    this.showRanks = true;
  }

  removeRank(index: number) {
    this.ranks.removeAt(index);
  }

  async onSubmit() {
    console.log('[NewMartialArtComp] Creating new martial art...');

    // Cycle through the ranks array and set the correct rank numbers
    let ranks = this.ranks.value;
    for(let i=0; i<ranks.length; i++) {
      ranks[i].number = ranks.length-i;
    }

    // Sending the form to the backend
    await this.apollo.mutate<any>({
      mutation: newMA,
      variables: {
        name: this.maName.value,
        styleName: this.styleName.value,
        description: this.description.value,
        ranks: ranks,
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

  async onUpdate() {
    console.log('[NewMartialArtComp] Updating martial art...');

    // Cycle through the ranks array and set the correct rank numbers
    let ranks = this.ranks.value;
    for(let i=0; i<ranks.length; i++) {
      ranks[i].number = ranks.length-i;
    }

    // Sending the form to the backend
    await this.apollo.mutate<any>({
      mutation: updateMA,
      variables: {
        id: this.ma._id,
        name: this.maName.value,
        styleName: this.styleName.value,
        description: this.description.value,
        ranks: ranks
      },
    }).subscribe(response => {
      if (response.data) {
        this.alerts.push({type:"success", message: 'Martial art was updated!'});
        console.log('[NewMartialArtComp] Done.');
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[ExamResult] ', JSON.stringify(err));
    });
    this.maService.fetch();
  }

  onCancel() {
    this.cancelEdit.emit("true");
  }

  onDelete() {
    this.maService.martialArts = this.maService.martialArts.filter(ma => ma._id != this.ma._id);

    this.router.navigateByUrl('/martialArts');
  }

  openPopup(content) {
    this.modalService.open(content);
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

  drop(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.ranks.controls, event.previousIndex, event.currentIndex);
    moveItemInArray(this.ranks.value, event.previousIndex, event.currentIndex);
  }

}
