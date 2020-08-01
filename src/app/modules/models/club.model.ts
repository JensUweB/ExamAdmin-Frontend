import { MartialArt } from './martialArt.model';
import { User } from './user.model';

export class Club {
    _id: string;
    name: string;
    street: string;
    zip: string;
    city: string;
    registrationId: string;
    country: string;
    martialArts: MartialArt[];
    admins: User[];
}
