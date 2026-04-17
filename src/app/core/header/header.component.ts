import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../shared/theme.service';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isDarkMode$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearch(event: any): void {
    const query = event.target.value;
    if (query !== undefined) {
      this.router.navigate(['/'], { queryParams: { q: query } });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
