import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { MartialArt } from '../../models/martialArt.model';

@Component({
  selector: 'app-new-exam',
  templateUrl: './new-exam.component.html',
  styleUrls: ['./new-exam.component.css']
})
export class NewExamComponent implements OnInit {

  private user: User;
  private isExaminer = false;
  private martialArts: MartialArt[];

  constructor(private authService: AuthService) {
    this.user = authService.user; 
    
    this.user.martialArts.forEach(ma => {
      if(ma._id.examiners.includes(this.user._id)) this.martialArts.push(ma._id);
    });

    if(this.martialArts.length > 0) {this.isExaminer=true;}
  }

  ngOnInit() {
  }

}
