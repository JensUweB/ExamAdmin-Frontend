import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
  @Input('currentExam') currentExam;

  constructor() { }

  ngOnInit() {
  }

}
