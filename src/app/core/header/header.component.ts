import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/theme.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly searchQuery = signal('');
  readonly isMobileMenuOpen = signal(false);
  readonly isDarkMode = this.themeService.isDarkMode;
  readonly currentUser = this.authService.currentUser;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  onSearch(event: any): void {
    const query = event.target.value;
    if (query !== undefined) {
      this.searchQuery.set(query);
      this.router.navigate(['/'], { queryParams: { q: query } });
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
