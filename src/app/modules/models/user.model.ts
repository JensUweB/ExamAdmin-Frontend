import { Club } from './club.model';
import { MartialArt } from './martialArt.model';

export class User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    martialArts: [{
        _id: MartialArt,
        rankName: string,
        rankNumber: number
    }];
    clubs: [{
        club: Club,
        confirmed: boolean
    }];
}