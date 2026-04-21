import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';
import { DataService } from '../../shared/data.service';
import { AuthService } from '../../core/auth.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [PostCardComponent, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<User | undefined>(undefined);
  readonly userPosts = signal<Post[]>([]);
  readonly activeTab = signal<'posts' | 'about'>('posts');
  readonly loading = signal<boolean>(true);

  readonly isOwnProfile = computed(() => {
    const displayedUser = this.user();
    const loggedInUser = this.authService.currentUser();
    
    if (!displayedUser || !loggedInUser) return false;
    
    // Compare by username or ID
    return displayedUser.username === loggedInUser.username || displayedUser.id === loggedInUser.id;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const username = params.get('username');
        if (username) {
          this.loadUserProfile(username);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  loadUserProfile(username: string): void {
    this.loading.set(true);
    this.user.set(undefined);
    this.userPosts.set([]);

    this.dataService.getUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user.set(user);
            if (user.posts && user.posts.length > 0) {
              this.loadUserPosts(user.posts);
            } else {
              this.loadPostsByUsername(user.username);
            }
          } else {
            console.error('User not found');
            this.router.navigate(['/']);
            this.loading.set(false);
          }
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          this.loading.set(false);
          this.router.navigate(['/']);
        }
      });
  }

  loadUserPosts(postIds: number[]): void {
    if (!postIds.length) {
      this.userPosts.set([]);
      this.loading.set(false);
      return;
    }

    const postObservables = postIds.map(id => this.dataService.getPostById(id));

    forkJoin(postObservables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.userPosts.set(posts.filter((post): post is Post => post !== undefined));
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching user posts:', error);
          this.userPosts.set([]);
          this.loading.set(false);
        }
      });
  }

  loadPostsByUsername(username: string): void {
    this.dataService.getPostsByUser(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.userPosts.set(posts);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching posts by username:', error);
          this.userPosts.set([]);
          this.loading.set(false);
        }
      });
  }

  changeTab(tab: 'posts' | 'about'): void {
    this.activeTab.set(tab);
  }

  followProfile(): void {
    const u = this.user();
    if (!u?.username) return;

    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.dataService.followUser(u.id, this.authService.getCurrentUser()!.id).subscribe();
  }
}
