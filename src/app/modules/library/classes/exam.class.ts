import { Club } from './club.class';
import { User } from './user.class';
import { MartialArt } from './martialArt.class';

export class Exam {
    _id: string;
    title: string;
    description: string;
    price: string;
    minRank: string;
    examDate: string;
    regEndDate: string;
    isPublic: boolean;
    club: Club;
    examiner: User;
    examPlace: string;
    martialArt: MartialArt;
    participants: User[];
    isHidden: boolean;
}
