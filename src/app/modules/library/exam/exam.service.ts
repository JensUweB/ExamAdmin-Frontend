import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { normalizeDate } from '../../shared/helpers/date.helper';
import { ToastService } from '../../core/services/toast.service';
import { Exam } from '../../models/exam.model';

const examsQuery = gql`
  query getAllExams($minDate: DateTime!) {
    getAllExams(minDate: $minDate) {
      _id
      title
      description
      examDate
      regEndDate
      examPlace
      price
      minRank
      participants {
        _id
        firstName
        lastName
        martialArts {
          _id {
            _id
          }
          rankId
        }
      }
      martialArt {
        _id
        name
        styleName
        ranks {
          _id
          name
          number
        }
      }
      examiner {
        _id
        firstName
        lastName
      }
    }
  }
`;

const userExamsQuery = gql`
query getUserExams($minDate: DateTime!) {
  getUserExams(minDate: $minDate) {
    _id
    title
    description
    examDate
    regEndDate
    examPlace
    price
    minRank
    participants {
      _id
      firstName
      lastName
      martialArts {
        _id {
          _id
        }
        rankId
      }
    }
    martialArt {
      _id
      name
      styleName
      ranks {
        _id
        name
        number
      }
    }
    examiner {
      _id
      firstName
      lastName
    }
  }
}
`;

const clubsQuery = gql`
  query getClubById($id: String!) {
    getClubById(id: $id) {
      _id
      name
    }
  }
`;

@Injectable()
export class ExamService {
  private currentExam;
  private _exams: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private querySubscription: Subscription;
  private user;

  public readonly exams = this._exams.asObservable();
  public editExam = false;

  constructor(
    private apollo: Apollo,
    private toastService: ToastService
  ) {
  }

  fetchExams() {
    this.apollo
      .watchQuery<any>({
        query: examsQuery,
        variables: {
          minDate: new Date(Date.now()),
        },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.subscribe(
        (response) => {
          if (response.data) {
            this._exams.next(this.processExams(response.data.getAllExams));
          }
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            'Server Fehler!',
            'Prüfungen konnten nicht abgefragt werden!'
          );
        }
      );
  }

  /**
   * Fetches all exams where the current user was either examiner or participant
   * @param previousMonth the number of months you want to go back. e.g. '3' means, you get exams of the past three months
   */
  fetchUserExams(previousMonth: number = 0): Observable<Exam[]> {
    const date = new Date(Date.now());
    date.setMonth(date.getMonth() - previousMonth);

    return new Observable((subscriber) => {
      this.apollo
      .watchQuery<any>({
        query: userExamsQuery,
        variables: {
          minDate: date,
        },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.subscribe(
        (response) => {
          if (response.data) {
            subscriber.next(this.processExams(response.data.getUserExams));
            subscriber.complete();
          }
        },
        (err) => {
          console.error(err);
          this.toastService.error(
            'Server Fehler!',
            'Prüfungen konnten nicht abgefragt werden!'
          );
        }
      );
    });
  }

  processExams(exams) {
    exams.forEach((exam) => {
      exam.examDate = normalizeDate(exam.examDate);
      exam.regEndDate = normalizeDate(exam.regEndDate);
      exam.isHidden = true;

      // Filter all participants martial arts list to get info about the participant related to the current exam
      if (exams) {
        exams.forEach((item) => {
          if (item.participants) {
            item.participants.forEach((user) => {
              if (Array.isArray(user.martialArts)) {
                user.martialArts = user.martialArts.filter(
                  (ma) => ma._id._id === item.martialArt._id
                );

                if (user.martialArts[0]) {
                  user.martialArts = {
                    ...item.martialArt.ranks.filter(
                      (rank) => rank._id === user.martialArts[0].rankId
                    ),
                  };
                }
              }
            });
          }
        });
      }
    });
    return exams;
  }

  setExam(exam) {
    this.currentExam = exam;
  }

  getExam() {
    return this.currentExam;
  }
}
