import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ExamService {
    currentExam = new Subject<any>();

    constructor() {}

    setExam(exam) {
        this.currentExam.next(exam);
    }
}