import { Club } from './club.class';
import { MartialArt } from './martialArt.class';
import { MaRank } from './maRank.class';

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
