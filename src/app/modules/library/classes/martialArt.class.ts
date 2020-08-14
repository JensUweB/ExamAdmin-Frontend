import { User } from './user.class';

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
