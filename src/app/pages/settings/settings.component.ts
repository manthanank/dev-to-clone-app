import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  protected readonly authService = inject(AuthService);

  readonly name = signal('');
  readonly email = signal('');
  readonly username = signal('');
  readonly avatar = signal('');
  readonly bio = signal('');
  readonly apiUrl = signal('');
  readonly apiKey = signal('');
  readonly saveMessage = signal('');

  constructor() {}

  ngOnInit(): void {
    this.apiUrl.set(this.authService.getApiUrl());
    this.apiKey.set(this.authService.getApiKey());
    
    // Using an effect or direct subscription for signals-based auth
    const user = this.authService.currentUser();
    if (user) {
      this.name.set(user.name);
      this.email.set(user.email);
      this.username.set(user.username);
      this.avatar.set(user.avatar || '');
      this.bio.set(user.bio || '');
    }
  }

  saveProfile(): void {
    this.authService.setApiUrl(this.apiUrl().trim());
    this.authService.setApiKey(this.apiKey().trim());
    this.authService.updateCurrentUser({
      name: this.name().trim(),
      email: this.email().trim(),
      username: this.username().trim(),
      avatar: this.avatar().trim(),
      bio: this.bio().trim()
    });
    this.saveMessage.set('Profile saved successfully.');
    setTimeout(() => this.saveMessage.set(''), 3000);
  }
}
