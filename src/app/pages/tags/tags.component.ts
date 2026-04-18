import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../shared/data.service';
import { DecimalPipe } from '@angular/common';

interface TagInfo {
  name: string;
  description: string;
  count: number;
}

@Component({
    selector: 'app-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.scss'],
    imports: [DecimalPipe]
})
export class TagsComponent implements OnInit {
  followedTags: Set<string> = new Set<string>();
  tags: TagInfo[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('followed_tags');
    if (stored) {
      this.followedTags = new Set(JSON.parse(stored));
    }

    this.dataService.getPosts().subscribe(posts => {
      const byTag = new Map<string, number>();

      posts.forEach(post => {
        post.tags.forEach(tag => {
          const name = (tag || '').trim();
          if (!name) {
            return;
          }
          byTag.set(name, (byTag.get(name) || 0) + 1);
        });
      });

      this.tags = [...byTag.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          description: `Posts and discussions about ${name}`
        }));
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

    if (this.followedTags.has(tagName)) {
      this.followedTags.delete(tagName);
    } else {
      this.followedTags.add(tagName);
    }

    localStorage.setItem('followed_tags', JSON.stringify(Array.from(this.followedTags)));
  }
}
