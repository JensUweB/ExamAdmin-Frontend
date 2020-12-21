import { Component, OnInit, Input } from '@angular/core';
import { ExamService } from '../exam/exam.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  exams;
  filterForm: FormGroup;
  @Input() user;

  constructor(
    private router: Router,
    private examService: ExamService,
    private fb: FormBuilder,
  ) {
    this.examService.fetchUserExams(2).subscribe((data) => this.exams = data);

    this.filterForm = this.fb.group({
      monthCount: 0
    });
  }

  ngOnInit(): void {
  }

  showDetails(exam: any): void {
    this.examService.setExam(exam);
    this.examService.editExam = false;
    this.router.navigate(['/exam-details']);
  }

  showEdit(exam: any): void {
    this.examService.setExam(exam);
    this.examService.editExam = true;
    this.router.navigate(['/exam-details']);
  }

  onSelectChange() {
    this.examService.fetchUserExams(this.monthCount.value).subscribe((data) => this.exams = data);
  }

  get monthCount() {
    return this.filterForm.get('monthCount');
  }
}
