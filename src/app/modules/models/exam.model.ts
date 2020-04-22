import { Club } from './club.model';
import { User } from './user.model';
import { MartialArt } from './martialArt.model';

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