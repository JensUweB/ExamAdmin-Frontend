import { Injectable, OnInit, OnDestroy } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Subscription, BehaviorSubject } from "rxjs";
import { normalizeDate } from "../helpers/date.helper";
import { logError } from '../helpers/error.helpers';

const examsQuery = gql`
query {getPlannedExams {
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
export class ExamService implements OnInit, OnDestroy {
  private currentExam;
  private _exams: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public readonly exams = this._exams.asObservable();
  editExam = false;
  private querySubscription: Subscription;
  private examinerClubs = [];

  constructor(private apollo: Apollo) {}

  printError(err) {
    logError('[UserComponent]',err);
    //this.alerts.push({type: 'danger', message: getGraphQLError(err)});
  }

  fetchExams() {
    console.log('[ExamService] Fetching data...');
    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: examsQuery,
        fetchPolicy: "no-cache"
      })
      .valueChanges.subscribe(
        response => {
          if (response.data) {
            let exams = response.data.getPlannedExams;
            console.log("[ExamService] Got some data. Preparing data...");
            exams.forEach(exam => {
              exam.examDate = normalizeDate(exam.examDate);
              exam.regEndDate = normalizeDate(exam.regEndDate);
              exam.isHidden = true;

              if (exams) {
                exams.forEach(exam => {
                  if (exam.participants) {
                    exam.participants.forEach(user => {
                      if(Array.isArray(user.martialArts)) {
                        user.martialArts = user.martialArts.filter(ma => ma._id._id == exam.martialArt._id);
                        
                        if(user.martialArts[0]) {
                          user.martialArts = {...exam.martialArt.ranks.filter(rank => rank._id == user.martialArts[0].rankId)};
                        }
                      }
                    });
                  }
                });
              }
              this._exams.next(exams);
              console.log('[ExamService] Done.');
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

    // ngOnInit does not work at all
  ngOnInit() {
    this.fetchExams();
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
