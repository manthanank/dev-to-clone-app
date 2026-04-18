import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.interface';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    imports: [FormsModule, AsyncPipe]
})
export class SettingsComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  name = '';
  email = '';
  username = '';
  avatar = '';
  bio = '';
  apiUrl = '';
  apiKey = '';
  saveMessage = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.apiUrl = this.authService.getApiUrl();
    this.apiKey = this.authService.getApiKey();
    this.currentUser$.subscribe(user => {
      if (!user) {
        return;
      }

      this.name = user.name;
      this.email = user.email;
      this.username = user.username;
      this.avatar = user.avatar || '';
      this.bio = user.bio || '';
    });
  }

  saveProfile(): void {
    this.authService.setApiUrl(this.apiUrl);
    this.authService.setApiKey(this.apiKey);
    this.authService.updateCurrentUser({
      name: this.name.trim(),
      email: this.email.trim(),
      username: this.username.trim(),
      avatar: this.avatar.trim(),
      bio: this.bio.trim()
    });
    this.saveMessage = 'Profile saved successfully.';
  }
}
