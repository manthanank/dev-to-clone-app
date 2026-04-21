import { Component, ChangeDetectionStrategy, inject, signal, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../models/post.interface';
import { DataService } from '../../shared/data.service';
import { AuthService } from '../../core/auth.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';

interface TrendingItem {
  title: string;
  tags: string;
}

interface SuggestedUser {
  username: string;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterLink, PostCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly dataService = inject(DataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selectedTag = signal<string>('');
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<string>('latest');
  
  readonly popularTags = signal<string[]>([]);
  readonly trending = signal<TrendingItem[]>([]);
  readonly suggestedUsers = signal<SuggestedUser[]>([]);

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.searchQuery.set(params['q'] || '');
        this.selectedTag.set(params['tag'] || '');
        this.loadPosts();
      });
  }

  setSortBy(sort: string): void {
    this.sortBy.set(sort);
    this.applySort();
  }

  private applySort(): void {
    const currentSort = this.sortBy();
    const currentPosts = [...this.posts()];
    
    if (currentSort === 'latest') {
      currentPosts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    } else if (currentSort === 'top') {
      currentPosts.sort((a, b) => b.likes - a.likes);
    }
    
    this.posts.set(currentPosts);
  }

  loadPosts(): void {
    this.loading.set(true);

    const query = this.searchQuery();
    const tag = this.selectedTag();

    if (query) {
      this.dataService.searchPosts(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (posts) => {
            this.posts.set(posts);
            this.applySort();
            this.updateSidebarData(posts);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error searching posts:', error);
            this.loading.set(false);
          }
        });
      return;
    }

    if (tag) {
      this.loadPostsByTag(tag);
      return;
    }

    this.dataService.getPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.posts.set(posts);
          this.applySort();
          this.updateSidebarData(posts);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching posts:', error);
          this.loading.set(false);
        }
      });
  }

  loadPostsByTag(tag: string): void {
    this.loading.set(true);
    this.dataService.getPostsByTag(tag)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.posts.set(posts);
          this.applySort();
          this.updateSidebarData(posts);
          this.loading.set(false);
        },
        error: (error) => {
          console.error(`Error fetching posts by tag ${tag}:`, error);
          this.loading.set(false);
        }
      });
  }

  filterByTag(tag: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag, q: null },
      queryParamsHandling: 'merge'
    });
  }

  clearTagFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: null },
      queryParamsHandling: 'merge'
    });
  }

  followUser(username: string): void {
    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.router.navigate(['/user', username]);
  }

  private updateSidebarData(posts: Post[]): void {
    const tagFrequency = new Map<string, number>();
    const suggestedByUsername = new Map<string, SuggestedUser>();

    posts.forEach(post => {
      post.tags.forEach(t => {
        const normalizedTag = (t || '').trim();
        if (!normalizedTag) {
          return;
        }
        tagFrequency.set(normalizedTag, (tagFrequency.get(normalizedTag) || 0) + 1);
      });

      const username = post.author?.username;
      if (username && !suggestedByUsername.has(username)) {
        suggestedByUsername.set(username, {
          username,
          name: post.author.name,
          role: `@${username}`,
          avatar: post.author.avatar
        });
      }
    });

    this.popularTags.set([...tagFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag));

    this.trending.set(posts
      .slice()
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map(post => ({
        title: post.title,
        tags: post.tags.slice(0, 2).map(tag => `#${tag}`).join(' ') || '#dev'
      })));

    this.suggestedUsers.set([...suggestedByUsername.values()].slice(0, 5));
  }
}
