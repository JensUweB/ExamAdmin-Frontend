import { Club } from './club.model';
import { MartialArt } from './martialArt.model';
import { MaRank } from './maRank.model';

export class User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    martialArts: MaRank[];
    clubs: {
        club: Club,
        confirmed: boolean
    }[];
}