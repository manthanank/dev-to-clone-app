import { Component, ChangeDetectionStrategy, inject, signal, input, effect, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from '../../models/post.interface';
import { DataService } from '../data.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
  imports: [DatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class PostCardComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly post = input.required<Post>();
  readonly isPriority = input<boolean>(false);
  readonly isLiked = signal(false);
  readonly isBookmarked = signal(false);
  readonly likesCount = signal(0);

  constructor() {
    effect(() => {
      this.likesCount.set(this.post().likes);
    });
  }

  navigateToPost(): void {
    this.router.navigate(['/post', this.post().id]);
  }

  navigateToAuthor(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/user', this.post().author.username || this.post().author.id]);
  }

  likePost(event: Event): void {
    event.stopPropagation();
    if (!this.isLiked()) {
      this.dataService.likePost(this.post().id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.isLiked.set(true);
              this.likesCount.update(c => c + 1);
            }
          },
          error: (error) => console.error('Error liking post:', error)
        });
    }
  }

  bookmarkPost(event: Event): void {
    event.stopPropagation();
    if (!this.isBookmarked()) {
      this.dataService.bookmarkPost(this.post().id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.isBookmarked.set(true);
            }
          },
          error: (error) => console.error('Error bookmarking post:', error)
        });
    }
  }
}
