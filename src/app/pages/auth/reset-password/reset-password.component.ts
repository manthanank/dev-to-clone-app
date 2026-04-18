import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styles: [],
    imports: [FormsModule, RouterLink]
})
export class ResetPasswordComponent {
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.password).subscribe({
      next: (ok) => {
        this.isLoading = false;
        if (!ok) {
          this.errorMessage = 'Reset request expired. Please request a new link.';
          return;
        }
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to reset password. Please try again.';
      }
    });
  }
}
