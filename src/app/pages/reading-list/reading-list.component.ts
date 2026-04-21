import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { DataService } from '../../shared/data.service';
import { Post } from '../../models/post.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PostCardComponent } from '../../shared/post-card/post-card.component';

@Component({
  selector: 'app-reading-list',
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.css'],
  imports: [RouterLink, PostCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadingListComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookmarkedPosts = signal<Post[]>([]);
  readonly loading = signal<boolean>(true);

  constructor() {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.loading.set(true);
    this.dataService.getBookmarkedPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.bookmarkedPosts.set(posts);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
          this.loading.set(false);
        }
      });
  }
}
