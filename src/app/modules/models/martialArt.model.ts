import { User } from './user.model';

export class MartialArt {
    _id: string;
    name: string;
    styleName: string;
    description: string;
    examiners: any[];
    ranks: [{
        _id: string,
        name: string,
        number: string
    }];
    canEdit: boolean;
}