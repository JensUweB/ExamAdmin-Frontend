import { MartialArt } from './martialArt.model';
import { User } from './user.model';

export class Club {
    name: string;
    street: string;
    zip: string;
    city: string;
    registrationId: string;
    country: string;
    martialArts: MartialArt[];
    admins: User[];
}