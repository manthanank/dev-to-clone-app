import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styles: []
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  isSent = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSent = true;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to send reset instructions. Please try again.';
      }
    });
  }
}
