import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';
import { DataService } from '../../shared/data.service';
import { AuthService } from '../../core/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | undefined;
  userPosts: Post[] = [];
  activeTab: 'posts' | 'about' = 'posts';
  loading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const username = params.get('username');
        if (username) {
          this.loadUserProfile(username);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(username: string): void {
    this.loading = true;

    this.dataService.getUserByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;

            // Load user's posts
            if (user.posts && user.posts.length > 0) {
              this.loadUserPosts(user.posts);
            } else {
              this.loadPostsByUsername(user.username);
            }
          } else {
            console.error('User not found');
            this.router.navigate(['/']);
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          this.loading = false;
          this.router.navigate(['/']);
        }
      });
  }

  loadUserPosts(postIds: number[]): void {
    if (!postIds.length) {
      this.userPosts = [];
      this.loading = false;
      return;
    }

    // Use forkJoin to efficiently load all user posts in parallel
    const postObservables = postIds.map(id => this.dataService.getPostById(id));

    forkJoin(postObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          // Filter out any undefined posts
          this.userPosts = posts.filter(post => post !== undefined) as Post[];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching user posts:', error);
          this.userPosts = [];
          this.loading = false;
        }
      });
  }

  loadPostsByUsername(username: string): void {
    this.dataService.getPostsByUser(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.userPosts = posts;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching posts by username:', error);
          this.userPosts = [];
          this.loading = false;
        }
      });
  }

  changeTab(tab: 'posts' | 'about'): void {
    this.activeTab = tab;
  }

  followProfile(): void {
    if (!this.user?.username) {
      return;
    }

    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.dataService.followUser(this.user.id, this.authService.getCurrentUser()!.id).subscribe();
  }
}
