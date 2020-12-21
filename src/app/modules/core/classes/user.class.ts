import { Club } from '../../library/classes/club.class';
import { MartialArt } from '../../library/classes/martialArt.class';
import { MaRank } from '../../library/classes/maRank.class';

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
