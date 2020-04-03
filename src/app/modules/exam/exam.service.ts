import { Injectable, OnInit, OnDestroy } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { Subscription } from "rxjs";
import { normalizeDateTime } from "../helpers/date.helper";
import { Exam } from "../models/exam.model";
import { userInfo } from "os";

const examsQuery = gql`
  query getPlannedExams {
    getPlannedExams {
      _id
      title
      description
      examDate
      regEndDate
      isPublic
      examPlace
      club {
        name
      }
      participants {
        _id
        firstName
        lastName
        martialArts {
          _id {
            _id
          }
          rankName
        }
      }
      martialArt {
        _id
        name
        styleName
      }
      examiner {
        _id
        firstName
        lastName
        clubs {
          club {
            _id
          }
        }
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
export class ExamService implements OnInit, OnDestroy {
  private currentExam;
  exams: any;
  editExam = false;
  private querySubscription: Subscription;
  private examinerClubs = [];

  constructor(private apollo: Apollo) {}

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
            this.exams = response.data.getPlannedExams;
            console.log("[ExamService] Got some data. Preparing data...");
            this.exams.forEach(exam => {
              exam.examDate = normalizeDateTime(exam.examDate);
              exam.regEndDate = normalizeDateTime(exam.regEndDate);
              exam.isHidden = true;

              if (this.exams) {
                this.exams.forEach(exam => {
                  if (exam.participants) {
                    exam.participants.forEach(user => {
                      user.martialArts = user.martialArts.filter(
                        ma => ma._id._id == exam.martialArt._id
                      );
                    });
                  }
                });
              }
              console.log("[ExamService] Data preparing done!");
            });
          }
        },
        err => {
          console.warn(
            "[ExamService]: GraphQL Error:",
            err.graphQLErrors[0].message
          );
        }
      );
  }

  setExam(exam) {
    this.currentExam = exam;

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
  }

  getExam() {
    return this.currentExam;
  }

  getExams() {
      if(this.exams){
        return this.exams;
      } else {
          this.fetchExams();
          return this.exams;
      }
  }

  getCurrentClubs() {
    return this.examinerClubs;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
