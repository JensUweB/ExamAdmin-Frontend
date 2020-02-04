import { User } from './user.model';

export class MartialArt {
    name: string;
    styleName: string;
    deescription: string;
    examiner: User[];
    ranks: [{
        name: string,
        number: string
    }];
}