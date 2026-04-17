import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Post } from '../../models/post.interface';
import { DataService } from '../data.service';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnDestroy {
  @Input() post!: Post;
  isLiked = false;
  isBookmarked = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToPost(): void {
    this.router.navigate(['/post', this.post.id]);
  }

  navigateToAuthor(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/user', this.post.author.username || this.post.author.id]);
  }

  likePost(event: Event): void {
    event.stopPropagation();
    if (!this.isLiked) {
      this.dataService.likePost(this.post.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.post = updatedPost;
              this.isLiked = true;
            }
          },
          error: (error) => console.error('Error liking post:', error)
        });
    }
  }

  bookmarkPost(event: Event): void {
    event.stopPropagation();
    if (!this.isBookmarked) {
      this.dataService.bookmarkPost(this.post.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.post = updatedPost;
              this.isBookmarked = true;
            }
          },
          error: (error) => console.error('Error bookmarking post:', error)
        });
    }
  }
}
