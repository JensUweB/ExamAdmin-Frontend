import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  title = 'Exam-Admin Frontend';
  // Placeholder
  user = {
    firstName: "Max",
    lastName: "Meier",
    email: "tester@localhost",
    martialArts: [{
      name: "Battojutsu",
      style: "Shobukan Inyo-Ryu",
      ranks: [{
        name: "1. Kyu",
        number: 11
      }]
    }],
    clubs: [{
      name: "Bürbacher Spielvereinigung 1909 e.V."
    }]
  }
}
