import { User } from '../../core/classes/user.class';
import { Exam } from './exam.class';

export class ExamResult {
    _id: string;
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
    };
    rank: string;
    date: Date;
    reportUri: string;
    passed: boolean;
}
