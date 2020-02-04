import { Component, OnInit, OnDestroy, HostListener  } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{
  private userSub: Subscription;
  isAuthenticated = false;
  navbarOpen = true;
  private screenHeight;
  private screenWidth;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.userSub = this.authService._isAuthenticated.subscribe(ele => {
      this.isAuthenticated = !!ele;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    if(this.screenWidth < 600) this.navbarOpen = false;
  }

  onLogout() {
    this.authService.logout();
  }

  addExam() {
    this.router.navigate(['/exams/new']);
  }

  addExamResult() {}

  addMA() {}

  addClub() {}

}
