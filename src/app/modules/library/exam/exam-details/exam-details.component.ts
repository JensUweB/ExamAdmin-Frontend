import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExamService } from '../exam.service';
import { Exam } from '../../classes/exam.class';
import { User } from '../../../core/classes/user.class';
import { AuthService } from '../../../core/auth/auth.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Alert } from '../../../types/Alert';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getGraphQLError, logError } from '../../../shared/helpers/error.helpers';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/modules/core/services/toast.service';
import { Helper } from 'src/app/modules/core/classes/helper.class';

const query = gql`mutation registerToExam($examId: String!){registerToExam(examId: $examId)}`;
const unregister = gql`mutation unregisterFromExam($examId: String!){unregisterFromExam(examId: $examId)}`;
const deleteQuery = gql`mutation deleteExam($examId: String!){deleteExam(examId: $examId)}`;
const updateQuery = gql`mutation updateExam($examId: String!, $title: String!, $description: String!, $price: Float!, $address: String!,
$examDate: DateTime, $regEndDate: DateTime, $userId: String, $maId: String!)
{updateExam(
  examId: $examId, input: {
  title: $title
  description: $description
  price: $price
  examPlace: $address
  examDate: $examDate
  regEndDate: $regEndDate
  examiner: $userId
  martialArt: $maId}){_id}}`;


@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.scss']
})
export class ExamDetailsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  rank: any;
  canRegister: boolean;
  isExaminer = false;
  exam: Exam;
  user: User;
  hasCheckedIn: boolean;
  editExam: boolean;
  examForm: FormGroup;
  displayedColumns = ['name', 'rank'];

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private toastService: ToastService,
    private apollo: Apollo,
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
    this.subscription = this.authService.user.subscribe(data => this.user = data);
    this.hasCheckedIn = this.exam.participants.some(user => user._id === this.user._id);

    if (this.exam.minRank !== undefined) {
      // Get the rank object of exam.minRank
      this.rank = this.exam.martialArt.ranks.filter(rank => {
        return rank._id === this.exam.minRank;
      })[0];

      if (this.rank !== undefined) {
        // Check if the user has the required min rank or better
        this.canRegister = this.user.martialArts.some(ma => {
          return +ma._id.ranks[0].number <= +this.rank.number;
        });
      } else {
        this.canRegister = true;
      }
    } else {
      this.canRegister = true;
    }

    if (this.exam.examiner._id === this.user._id) { this.isExaminer = true; }


    this.examForm = this.fb.group({
      title: [this.exam.title, Validators.required],
      description: [this.exam.description, Validators.required],
      examPlace: [this.exam.examPlace, Validators.required],
      price: [this.exam.price, Validators.required],
      examDate: [this.exam.examDate, Validators.required],
      regEndDate: [this.exam.regEndDate, Validators.required],
      examiner: [this.exam.examiner._id, Validators.required],
      martialArt: [this.exam.martialArt._id, Validators.required],
    });

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  printError(err) {
    console.error(err);
    this.toastService.error(Helper.locales.serverErrorTitle, $localize`An unexpected server error occured!`);
  }

  onCheckIn() {
    this.apollo.mutate<any>({
      mutation: query,
      variables: {
        examId: this.exam._id,
      }
    }).subscribe(response => {
      if (response.data) {
        this.hasCheckedIn = true;
        this.exam.participants.push(this.user);
        this.toastService.success(Helper.locales.successTitle, $localize`You have successfully registered for this exam`);
      }
    }, (err) => {
      this.printError(err);
    });
  }
  onCheckOut() {
    this.apollo.mutate<any>({
      mutation: unregister,
      variables: {
        examId: this.exam._id,
      }
    }).subscribe(response => {
      if (response.data) {
        this.hasCheckedIn = false;
        this.exam.participants = this.exam.participants.filter(user => user._id !== this.user._id);
        this.toastService.success(Helper.locales.successTitle, $localize`You have successfully logged out of this exam`);
      }
    }, (err) => {
      if (err.graphQLErrors[0]) {
        this.printError(err.graphQLErrors[0]);
      } else {
        this.printError(err);
      }
    });
  }

  onUpdate() {
    if (this.examForm.valid) {

      this.exam.title = this.title.value;
      this.exam.description = this.description.value;
      this.exam.price = this.price.value;
      this.exam.examPlace = this.examPlace.value;
      this.exam.examDate = this.examDate.value;
      this.exam.regEndDate = this.regEndDate.value;

      this.apollo.mutate<any>({
        mutation: updateQuery,
        variables: {
          examId: this.exam._id,
          title: this.title.value,
          description: this.description.value,
          price: this.price.value,
          address: this.examPlace.value,
          examDate: new Date(this.examDate.value),
          regEndDate: new Date(this.regEndDate.value),
          maId: this.martialArt.value
        }
      }).subscribe((response) => {
        this.examService.fetchExams();
        this.toastService.success(Helper.locales.successTitle, $localize`Exam details have been updated`);
      }, (err) => {
        this.printError(err);
      });
    }
  }

  onDelete() {
    this.apollo.mutate<any>({
      mutation: deleteQuery,
      variables: {
        examId: this.exam._id
      }
    }).subscribe((response) => {
      this.toastService.success(Helper.locales.successTitle, $localize`Delete successfull!`);
      this.router.navigate(['/exams']);
    }, (err) => {
      this.printError(err);
    });
  }

  openPopup(content) {
    this.modalService.open(content);
  }

  get martialArt() {
    return this.examForm.get('martialArt');
  }
  get club() {
    return this.examForm.get('club');
  }
  get title() {
    return this.examForm.get('title');
  }
  get description() {
    return this.examForm.get('description');
  }
  get price() {
    return this.examForm.get('price');
  }
  get examPlace() {
    return this.examForm.get('examPlace');
  }
  get minRank() {
    return this.examForm.get('minRank');
  }
  get examDate() {
    return this.examForm.get('examDate');
  }
  get examTime() {
    return this.examForm.get('examTime');
  }
  get regEndDate() {
    return this.examForm.get('regEndDate');
  }
  get regEndTime() {
    return this.examForm.get('regEndTime');
  }
  get isPublic() {
    return this.examForm.get('isPublic');
  }
}
