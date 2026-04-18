import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [HeaderComponent, RouterOutlet, RouterLink]
})
export class AppComponent {
  isAuthPage = false;

  constructor(private router: Router) {
    this.updateRouteFlags(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouteFlags(event.urlAfterRedirects);
      }
    });
  }

  private updateRouteFlags(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(cleanUrl);
  }
}
