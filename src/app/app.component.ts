import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
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
