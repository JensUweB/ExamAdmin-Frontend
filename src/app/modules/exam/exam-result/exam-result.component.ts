import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { AuthService } from '../../auth/auth.service';
import { Apollo } from 'apollo-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Alert } from '../../types/Alert';

const query = gql`{getOpenExams{_id, title, examDate, martialArt{_id, name, styleName, ranks{name}}, 
participants{_id, firstName, lastName}}}`;

const createExamResult = gql`mutation createExamResult($userId: String!, $examId: String!, $maId: String!, $maName: String!, $maStyle: String!
 $examinerId: String!, $exFirstName: String!, $exLastName: String!, $rank: String!, $date: String!, $passed: Boolean!)
{createExamResult(input: {user: $userId, exam: $examId, martialArt: {_id: $maId, name: $maName, styleName: $maStyle}, 
examiner: {_id: $examinerId, firstName: $exFirstName, lastName: $exLastName}, rank: $rank, date: $date, passed: $passed}){_id}}`;

const uploadFile = gql`mutation uploadExamProtocol($examResultId: String!, $file: Upload!)
{uploadExamProtocol(examResultId: $examResultId, protocol: $file)}`;

@Component({
  selector: 'app-exam-result',
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.css']
})
export class ExamResultComponent implements OnInit {
  exams;
  erForm: FormGroup;
  file: Blob;
  errors = [];
  erId: String;
  user;
  alerts: Alert[] = [];

  constructor(
    private authService: AuthService,
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    console.log('[ExamResult] Fetching data...');
    this.user = authService.user;
    this.apollo.watchQuery<any>({
      query: query,
      fetchPolicy: 'no-cache'
    }).valueChanges.subscribe((response) => {
      if (response.data) {
        this.exams = response.data.getOpenExams;
        console.log(this.exams);
        console.log('[ExamResult] Data: ', response.data);
      }
    }, (err) => { 
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[ExamResult]: GraphQL Error:', JSON.stringify(err)); 
    });

    this.erForm = this.fb.group({
      userId: ['', [Validators.required]],
      examId: ['', [Validators.required]],
      maId: ['', [Validators.required]],
      maName: ['', [Validators.required]],
      maStyle: ['', [Validators.required]],
      rank: ['', [Validators.required]],
      date: ['', [Validators.required]],
      passed: [false, [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  //($userId: String!, $examId: String!, $maId: String!, $maName: String!, $maStyle: String!
  //$examinerId: String!, $exFirstName: String!, $exLastName: String!, $rank: String!, $date: String!, $passed: Boolean!)
  async onSubmit() {
    // create new exam result
    await this.apollo.mutate<any>({
      mutation: createExamResult,
      variables: {
        userId: this.userId.value,
        examId: this.exams[this.examId.value]._id,
        maId: this.exams[this.examId.value].martialArt._id,
        maName: this.exams[this.examId.value].martialArt.name,
        maStyle: this.exams[this.examId.value].martialArt.styleName,
        examinerId: this.user._id,
        exFirstName: this.user.firstName,
        exLastName: this.user.lastName,
        rank: this.rank.value,
        date: this.exams[this.examId.value].examDate.toString(),
        passed: this.passed.value
      }
    }).subscribe(response => {
      if (response.data) {
        this.alerts.push({type:"success", message: 'Success! Exam Result created!'});
        this.uploadFile(response.data.createExamResult._id);
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[ExamResult] ', JSON.stringify(err));

      if (err.graphQLErrors[0].message.statusCode == 406) {this.erId = this.exams[this.examId.value]._id;}
    });
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  uploadFile(erId: string) {
    // Upload protocol file for the created exam result
    this.apollo.mutate<any>({
      mutation: uploadFile,
      variables: {
        examResultId: erId,
        file: this.file,
      },
      // Setting the context is very important i order for apollo-upload to work!
      context: {
         useMultipart: true
      }
    }).subscribe(response => {
      if (response.data) {
        this.alerts.push({type:"success", message: 'Exam Result Procotol Upload finished!'});
      }
    }, (err) => {
      if(err.graphQLErrors[0]) this.alerts.push({type: 'danger', message: err.graphQLErrors[0].message.message});
      else this.alerts.push({type: 'danger', message: err});
      console.warn('[ExamResult] ', JSON.stringify(err));
    });
  }

  get userId() {
    return this.erForm.get('userId');
  }
  get examId() {
    return this.erForm.get('examId');
  }
  get maId() {
    return this.erForm.get('maId');
  }
  get maName() {
    return this.erForm.get('maName');
  }
  get maStyle() {
    return this.erForm.get('maStyle');
  }
  get rank() {
    return this.erForm.get('rank');
  }
  get date() {
    return this.erForm.get('date');
  }
  get passed() {
    return this.erForm.get('passed');
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
