import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ExamService {
    private currentExam;
    editExam = false;

    constructor() {}

    setExam(exam) {
        this.currentExam = exam;
    }

    getExam() {
        return this.currentExam;
    }
}