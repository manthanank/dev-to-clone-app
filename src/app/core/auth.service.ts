import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { ApiConfigService } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  
  private readonly currentUserStorageKey = 'current_user';
  private readonly resetEmailStorageKey = 'reset_email';
  
  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.initUser();
  }

  private initUser(): void {
    const savedUser = localStorage.getItem(this.currentUserStorageKey);
    if (savedUser) {
      this._currentUser.set(JSON.parse(savedUser));
    } else if (this.apiConfig.getApiKey()) {
      // Fetch the real user associated with this API Key
      this.http.get<any>(`${this.apiConfig.apiUrl}/users/me`, { headers: this.apiConfig.getHeaders() }).pipe(
        tap(userData => {
          const user: User = {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            email: userData.email || '',
            avatar: userData.profile_image,
            bio: userData.summary || '',
            joinDate: new Date(userData.created_at || new Date()),
            followers: userData.followers_count || 0,
            following: userData.following_count || 0
          };
          this.updateUser(user);
        }),
        catchError(err => {
          console.error('Error fetching authenticated user:', err);
          this._currentUser.set(null);
          return of(null);
        })
      ).subscribe();
    } else {
      this._currentUser.set(null);
    }
  }

  public updateUser(user: User): void {
    localStorage.setItem(this.currentUserStorageKey, JSON.stringify(user));
    this._currentUser.set(user);
  }

  public updateCurrentUser(userPatch: Partial<User>): void {
    const currentUser = this._currentUser();
    if (!currentUser) {
      return;
    }

    this.updateUser({
      ...currentUser,
      ...userPatch,
      id: currentUser.id,
      joinDate: currentUser.joinDate
    });
  }

  public login(email: string, _password: string): Observable<User> {
    const username = email.split('@')[0]?.trim() || 'user';
    const user: User = {
      id: Date.now(),
      username,
      name: username,
      email,
      avatar: '',
      bio: '',
      joinDate: new Date(),
      followers: 0,
      following: 0
    };

    this.updateUser(user);
    return of(user);
  }

  public register(name: string, email: string, _password: string): Observable<User> {
    const user: User = {
      id: Date.now(),
      name,
      username: name.toLowerCase().replace(/\s+/g, ''),
      email,
      avatar: '',
      joinDate: new Date(),
      followers: 0,
      following: 0,
      bio: ''
    };

    this.updateUser(user);
    return of(user);
  }

  public requestPasswordReset(email: string): Observable<boolean> {
    localStorage.setItem(this.resetEmailStorageKey, email);
    return of(true);
  }

  public resetPassword(_password: string): Observable<boolean> {
    const resetEmail = localStorage.getItem(this.resetEmailStorageKey);
    if (!resetEmail) {
      return of(false);
    }

    localStorage.removeItem(this.resetEmailStorageKey);
    return of(true);
  }

  public getApiKey(): string {
    return this.apiConfig.getApiKey();
  }

  public setApiKey(apiKey: string): void {
    this.apiConfig.setApiKey(apiKey);
  }

  public getApiUrl(): string {
    return this.apiConfig.apiUrl;
  }

  public setApiUrl(apiUrl: string): void {
    this.apiConfig.setApiUrl(apiUrl);
  }

  public getCurrentUser(): User | null {
    return this._currentUser();
  }

  public logout(): void {
    localStorage.removeItem(this.currentUserStorageKey);
    this._currentUser.set(null);
  }
}
