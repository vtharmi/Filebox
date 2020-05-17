import { Component, OnInit } from '@angular/core';
import { AuthService } from '../user/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title = 'Filebox';
  userIsAuthenticated = false;
  private authListenerSubscription: Subscription;
  constructor(private authService: AuthService) { }
  
  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe(
      (isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
  }

  
  onlogout() {
    this.authService.logout()
  }
}
