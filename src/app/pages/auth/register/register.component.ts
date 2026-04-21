import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly name = signal('');
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
    const providerName = provider === 'github' ? 'GitHub' : 'Twitter';
    this.socialLoginMessage.set(`${providerName} registration is nearly ready. For now, please join us using the email form below.`);
    setTimeout(() => this.socialLoginMessage.set(''), 5000);
  }

  onSubmit(): void {
    const n = this.name().trim();
    const e = this.email().trim();
    const p = this.password().trim();

    if (!n || !e || !p) {
      this.errorMessage.set('All fields are required to build your developer profile.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(n, e, p)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.isLoading.set(false);
          this.errorMessage.set('We couldn\'t create your account right now. This email might already be in use.');
        }
      });
  }
}
