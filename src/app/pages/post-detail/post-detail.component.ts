import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Post } from '../../models/post.interface';
import { Comment } from '../../models/comment.interface';
import { User } from '../../models/user.interface';
import { DataService } from '../../shared/data.service';
import { AuthService } from '../../core/auth.service';
import { NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  imports: [RouterLink, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);

  readonly post = signal<Post | undefined>(undefined);
  readonly author = signal<User | undefined>(undefined);
  readonly comments = signal<Comment[]>([]);
  readonly relatedPosts = signal<Post[]>([]);
  readonly recommendedTags = signal<string[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isLiked = signal<boolean>(false);
  readonly isBookmarked = signal<boolean>(false);
  readonly newCommentContent = signal<string>('');
  
  readonly currentUserAvatar = computed(() => {
    return this.authService.currentUser()?.avatar || this.post()?.author?.avatar || '';
  });

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = Number(params['id']);
        if (id) {
          this.loadPostDetails(id);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  loadPostDetails(postId: number): void {
    this.loading.set(true);
    this.post.set(undefined);
    this.author.set(undefined);
    this.comments.set([]);
    this.relatedPosts.set([]);

    this.dataService.getPostById(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (post) => {
          if (post) {
            this.post.set(post);
            this.isBookmarked.set(this.dataService.isBookmarked(post.id));

            if (post.author.username) {
              this.dataService.getUserByUsername(post.author.username)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: user => this.author.set(user),
                  error: err => console.error('Error fetching author details:', err)
                });
            }

            if (post.tags && post.tags.length > 0) {
              this.loadRelatedPostsByTag(post.tags[0], postId);
              this.recommendedTags.set([...post.tags]);
            }

            this.loadComments(postId);
          } else {
            console.error('Post not found');
            this.router.navigate(['/']);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching post:', error);
          this.loading.set(false);
          this.router.navigate(['/']);
        }
      });
  }

  loadComments(postId: number): void {
    this.dataService.getCommentsByPost(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comments) => this.comments.set(comments),
        error: (error) => console.error('Error fetching comments:', error)
      });
  }

  loadRelatedPostsByTag(tag: string, currentPostId: number): void {
    this.dataService.getPostsByTag(tag)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (posts) => {
          this.relatedPosts.set(posts
            .filter(p => p.id !== currentPostId)
            .slice(0, 3));
        },
        error: (error) => {
          console.error('Error fetching related posts:', error);
          this.relatedPosts.set([]);
        }
      });
  }

  likePost(): void {
    const p = this.post();
    if (p && !this.isLiked()) {
      this.dataService.likePost(p.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.post.set(updatedPost);
              this.isLiked.set(true);
            }
          },
          error: (error) => console.error('Error liking post:', error)
        });
    }
  }

  bookmarkPost(): void {
    const p = this.post();
    if (p) {
      this.dataService.bookmarkPost(p.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedPost) => {
            if (updatedPost) {
              this.post.set(updatedPost);
              this.isBookmarked.set(this.dataService.isBookmarked(p.id));
            }
          },
          error: (error) => console.error('Error bookmarking post:', error)
        });
    }
  }

  submitComment(): void {
    const p = this.post();
    if (!p || !this.newCommentContent().trim()) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const newComment: Omit<Comment, 'id'> = {
      postId: p.id,
      content: this.newCommentContent().trim(),
      publishedDate: new Date(),
      likes: 0,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      }
    };

    this.dataService.createComment(newComment)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment) => {
          this.comments.update(old => [comment, ...old]);
          this.newCommentContent.set('');
          this.post.update(old => old ? { ...old, comments: old.comments + 1 } : undefined);
        },
        error: (error) => console.error('Error posting comment:', error)
      });
  }

  followAuthor(): void {
    const p = this.post();
    if (!p?.author.username) return;

    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.router.navigate(['/user', p.author.username]);
  }

  likeComment(commentId: number): void {
    this.dataService.likeComment(commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedComment) => {
          if (updatedComment) {
            this.comments.update(old => old.map(c => c.id === commentId ? updatedComment : c));
          }
        },
        error: (error) => console.error('Error liking comment:', error)
      });
  }
}
