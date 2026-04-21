import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../shared/data.service';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TagInfo {
  name: string;
  description: string;
  count: number;
}

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly followedTags = signal<Set<string>>(new Set<string>());
  readonly tags = signal<TagInfo[]>([]);
  readonly loading = signal<boolean>(true);

  constructor() {}

  ngOnInit(): void {
    const stored = localStorage.getItem('followed_tags');
    if (stored) {
      try {
        this.followedTags.set(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Error parsing followed tags', e);
      }
    }

    this.dataService.getPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          const byTag = new Map<string, number>();

          posts.forEach(post => {
            post.tags.forEach(tag => {
              const name = (tag || '').trim();
              if (name) {
                byTag.set(name, (byTag.get(name) || 0) + 1);
              }
            });
          });

          const tagInfoList = [...byTag.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({
              name,
              count,
              description: `Explore the best of ${name} development, tutorials, and community discussions.`
            }));
          
          this.tags.set(tagInfoList);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading tags', err);
          this.loading.set(false);
        }
      });
  }

  navigateToTag(tagName: string): void {
    this.router.navigate(['/'], { queryParams: { tag: tagName } });
  }

  toggleFollowTag(tagName: string, event: Event): void {
    event.stopPropagation();
    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.followedTags.update(tags => {
      const nextTags = new Set(tags);
      if (nextTags.has(tagName)) {
        nextTags.delete(tagName);
      } else {
        nextTags.add(tagName);
      }
      localStorage.setItem('followed_tags', JSON.stringify(Array.from(nextTags)));
      return nextTags;
    });
  }
}
