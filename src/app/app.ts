import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly router = inject(Router);
  protected readonly title = signal('dev-to-clone-app');

  isAuthPage = false;

  constructor() {
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