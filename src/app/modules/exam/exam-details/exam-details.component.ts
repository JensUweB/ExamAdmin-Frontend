import { Component, OnInit, Input } from '@angular/core';
import { ExamService } from '../exam.service';

@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
 private exam;
 private editExam;

  constructor(private examService: ExamService) { }

  ngOnInit() {
    this.exam = this.examService.getExam();
    this.editExam = this.examService.editExam;
  }

}
