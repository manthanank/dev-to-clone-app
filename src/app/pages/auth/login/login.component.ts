import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  socialLoginMessage = '';
  private returnUrl = '/';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  ngOnInit(): void {
    // Redirect already-logged-in users
    if (this.authService.getCurrentUser()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSocialLogin(provider: string): void {
    this.socialLoginMessage = `${provider === 'github' ? 'GitHub' : 'Twitter'} OAuth is not available in this demo. Please use email & password.`;
    setTimeout(() => this.socialLoginMessage = '', 4000);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to login. Please try again.';
      }
    });
  }
}
