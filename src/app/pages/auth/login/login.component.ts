import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly email = signal('');
  readonly password = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly socialLoginMessage = signal('');
  
  private readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

  constructor() {}

  ngOnInit(): void {
    if (this.authService.getCurrentUser()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSocialLogin(provider: string): void {
    const name = provider === 'github' ? 'GitHub' : 'Twitter';
    this.socialLoginMessage.set(`${name} OAuth is currently being integrated. Please use email & password for immediate access.`);
    setTimeout(() => this.socialLoginMessage.set(''), 5000);
  }

  onSubmit(): void {
    const e = this.email().trim();
    const p = this.password().trim();

    if (!e || !p) {
      this.errorMessage.set('Please enter both email and password to proceed.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(e, p)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.isLoading.set(false);
          this.errorMessage.set('Verification failed. Please check your credentials and try again.');
        }
      });
  }
}
