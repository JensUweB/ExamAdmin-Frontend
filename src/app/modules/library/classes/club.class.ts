import { MartialArt } from './martialArt.class';
import { User } from '../../core/classes/user.class';

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
