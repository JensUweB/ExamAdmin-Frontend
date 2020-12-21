import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Alert } from '../../../types/Alert';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../../core/auth/auth.service';
import { MartialArtsService } from '../martialArts.service';
import { MartialArt } from '../../classes/martialArt.class';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { logError, getGraphQLError } from '../../../shared/helpers/error.helpers';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/modules/core/services/toast.service';
import { Helper } from 'src/app/modules/core/classes/helper.class';

const newMA = gql`mutation createMartialArt
($name: String!, $styleName: String!, $description: String!, $ranks: [RankInput!], $userId: String!)
{createMartialArt(input: {
  	name: $name
    styleName: $styleName
    description: $description
    ranks: $ranks
  examiners: [$userId]
  }){_id}}`;

const updateMA = gql`mutation updateMartialArt
($id: String!, $name: String!, $styleName: String!, $description: String!, $ranks: [RankInput!])
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
export class NewMartialartComponent implements OnInit, OnDestroy {

  @Input() ma: MartialArt;
  @Output() cancelEdit = new EventEmitter();
  private subscription: Subscription;
  martialArts: MartialArt[];
  form: FormGroup;
  showRanks = false;
  private user;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private maService: MartialArtsService,
    private router: Router,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    if (!this.ma) {
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
    this.subscription = this.authService.user.subscribe(data => {this.user = data; });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addRankGroup(_id: string, name: string, num: number) {
    return this.fb.group({
      _id,
      name: [name, [Validators.required]],
      number: [num, [Validators.required]]
    });
  }

  setupRanks() {
    if (!this.ma) {
      const count: number = this.rankCount.value;
      for (let i = 0; i < count; i++) {
          this.ranks.push(this.addRankGroup(undefined, (count - i) + '. rank', count - i));
      }
    } else {
      for (const rank of this.ma.ranks) {
        this.ranks.push(this.addRankGroup(rank._id, rank.name, + rank.number));
      }
    }
    this.showRanks = true;
  }

  removeRank(index: number) {
    this.ranks.removeAt(index);
  }

  async onSubmit() {
    // Cycle through the ranks array and set the correct rank numbers
    const ranks = this.ranks.value;
    for (let i = 0; i < ranks.length; i++) {
      ranks[i].number = ranks.length - i;
    }

    // Sending the form to the backend
    await this.apollo.mutate<any>({
      mutation: newMA,
      variables: {
        name: this.maName.value,
        styleName: this.styleName.value,
        description: this.description.value,
        ranks,
        userId: this.user._id
      },
    }).subscribe(response => {
      if (response.data) {
        this.toastService.success(Helper.locales.successTitle, $localize`New martial art created!`);
      }
    }, (err) => {
      console.error(err);
      this.toastService.error(Helper.locales.serverErrorTitle, $localize`Could not create martial art`);
    });
    this.maService.fetch();
  }

  async onUpdate() {
    // Cycle through the ranks array and set the correct rank numbers
    const ranks = this.ranks.value;
    for (let i = 0; i < ranks.length; i++) {
      ranks[i].number = ranks.length - i;
    }

    // Update the current details object
    this.maService.martialArt.name = this.maName.value;
    this.maService.martialArt.styleName = this.styleName.value;
    this.maService.martialArt.ranks = this.ranks.value;
    this.maService.martialArt.description = this.description.value;

    // Sending the form to the backend
    await this.apollo.mutate<any>({
      mutation: updateMA,
      variables: {
        id: this.ma._id,
        name: this.maName.value,
        styleName: this.styleName.value,
        description: this.description.value,
        ranks
      },
    }).subscribe(response => {
      if (response.data) {
        this.maService.fetch();
        this.authService.loadUser();
        this.toastService.success(Helper.locales.successTitle, $localize`Martial art updated!`);
      }
    }, (err) => {
      console.error(err);
      this.toastService.error(Helper.locales.serverErrorTitle, $localize`Could not update martial art.`);
    });
  }

  onCancel() {
    this.cancelEdit.emit('true');
  }

  onDelete() {
    // this.maService.martialArts = this.martialArts.filter(ma => ma._id != this.ma._id);

    this.router.navigateByUrl('/martialArts');
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  get rankCount() {
    return this.form.get('rankCount');
  }

  get ranks() {
    return this.form.get('ranks') as FormArray;
  }

  get maName() {
    return this.form.get('name') as FormArray;
  }

  get styleName() {
    return this.form.get('styleName') as FormArray;
  }

  get description() {
    return this.form.get('description');
  }

  drop(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.ranks.controls, event.previousIndex, event.currentIndex);
    moveItemInArray(this.ranks.value, event.previousIndex, event.currentIndex);
  }

}
