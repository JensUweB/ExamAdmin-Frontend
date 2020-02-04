import { User } from './user.model';
import { Exam } from './exam.model';

export class ExamResult {
    user: User;
    exam: Exam;
    martialArt: {
        _id: string,
        name: string,
        styleName: string
    };
    examiner: {
        _id: string,
        firstName: string,
        lastName: string
    }
    rank: string;
    date: string;
    reportUri: string;
    passed: boolean;
}