import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Subscription, BehaviorSubject } from 'rxjs';
import { normalizeDate } from '../helpers/date.helper';
import { logError } from '../helpers/error.helpers';
import { filter } from 'rxjs/operators';

const examsQuery = gql`
query getAllExams($minDate: any){getAllExams(minDate: $minDate) {
  _id,title,description,examDate,regEndDate,examPlace, price, minRank
  participants {
    _id,firstName,lastName
    martialArts {
      _id {_id }, rankId
    }
  }
    martialArt {
    _id,name,styleName, ranks{_id, name, number}
  } examiner {
    _id,firstName,lastName}}}
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
  public readonly exams = this._exams.asObservable();
  editExam = false;
  private querySubscription: Subscription;
  private examinerClubs = [];

  constructor(private apollo: Apollo) {
    this.fetchExams();
  }

  printError(err) {
    console.error(err);
    // this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  fetchExams() {
    this.apollo
      .watchQuery<any>({
        query: examsQuery,
        variables: {
          minDate: new Date('2020-01-01')
        },
        fetchPolicy: 'no-cache'
      })
      .valueChanges.subscribe(
        (response) => {
          if (response.data) {
            const exams = response.data.getAllExams;
            exams.forEach(exam => {
              exam.examDate = normalizeDate(exam.examDate);
              exam.regEndDate = normalizeDate(exam.regEndDate);
              exam.isHidden = true;

              // Filter all participants martial arts list to get info about the participant related to the current exam
              if (exams) {
                exams.forEach((item) => {
                  if (item.participants) {
                    item.participants.forEach(user => {
                      if (Array.isArray(user.martialArts)) {
                        user.martialArts = user.martialArts.filter(ma => ma._id._id === item.martialArt._id);

                        if (user.martialArts[0]) {
                          user.martialArts = {...item.martialArt.ranks.filter(rank => rank._id === user.martialArts[0].rankId)};
                        }
                      }
                    });
                  }
                });
              }
              this._exams.next(exams);
            });
          }
        },
        err => {
          this.printError(err);
        }
      );
  }

  setExam(exam) {
    this.currentExam = exam;
    /*
    this.currentExam.examiner.clubs.forEach(ele => {
      this.apollo
        .watchQuery<any>({
          query: clubsQuery,
          variables: {
            id: ele.club._id
          },
          fetchPolicy: "no-cache"
        })
        .valueChanges.subscribe(
          response => {
            if (response.data) {
              this.examinerClubs.push(response.data.getClubById);
            }
          },
          err => {
            console.warn(
              "[ExamService]: GraphQL Error:",
              err.graphQLErrors[0].message
            );
          }
        );
    });
    */
  }

  getExam() {
    return this.currentExam;
  }

  getCurrentClubs() {
    return this.examinerClubs;
  }
}
