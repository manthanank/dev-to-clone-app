import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Post } from '../../models/post.interface';
import { DataService } from '../../shared/data.service';
import { AuthService } from '../../core/auth.service';
import { NgClass } from '@angular/common';
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
    styleUrls: ['./home.component.scss'],
    imports: [RouterLink, NgClass, PostCardComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading: boolean = true;
  selectedTag: string = '';
  searchQuery: string = '';
  sortBy: string = 'latest'; // Default sort
  popularTags: string[] = [];
  trending: TrendingItem[] = [];
  suggestedUsers: SuggestedUser[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['q'] || '';
        this.selectedTag = params['tag'] || '';
        this.loadPosts();
      });
  }

  setSortBy(sort: string): void {
    this.sortBy = sort;
    this.applySort();
  }

  private applySort(): void {
    if (this.sortBy === 'latest') {
      this.posts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    } else if (this.sortBy === 'top') {
      this.posts.sort((a, b) => b.likes - a.likes);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts(): void {
    this.loading = true;

    // Use search query if present
    if (this.searchQuery) {
      this.dataService.searchPosts(this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (posts) => {
            this.posts = posts;
            this.applySort();
            this.updateSidebarData(posts);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error searching posts:', error);
            this.loading = false;
          }
        });
      return;
    }

    // Use the tag filter if selected
    if (this.selectedTag) {
      this.loadPostsByTag(this.selectedTag);
      return;
    }

    this.dataService.getPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          this.applySort();
          this.updateSidebarData(posts);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching posts:', error);
          this.loading = false;
        }
      });
  }

  loadPostsByTag(tag: string): void {
    this.loading = true;
    this.dataService.getPostsByTag(tag)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          this.applySort();
          this.updateSidebarData(posts);
          this.loading = false;
        },
        error: (error) => {
          console.error(`Error fetching posts by tag ${tag}:`, error);
          this.loading = false;
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
      post.tags.forEach(tag => {
        const normalizedTag = (tag || '').trim();
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

    this.popularTags = [...tagFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    this.trending = posts
      .slice()
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map(post => ({
        title: post.title,
        tags: post.tags.slice(0, 2).map(tag => `#${tag}`).join(' ') || '#dev'
      }));

    this.suggestedUsers = [...suggestedByUsername.values()].slice(0, 5);
  }
}
