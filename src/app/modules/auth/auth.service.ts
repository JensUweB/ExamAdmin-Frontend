import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    user: any;

    logout() {
        throw new Error("Method not implemented.");
    }

}