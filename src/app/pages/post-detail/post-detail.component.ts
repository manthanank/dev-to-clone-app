import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
    styleUrls: ['./post-detail.component.scss'],
    imports: [NgClass, RouterLink, FormsModule, DatePipe]
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: Post | undefined;
  author: User | undefined;
  comments: Comment[] = [];
  relatedPosts: Post[] = [];
  recommendedTags: string[] = [];
  loading: boolean = true;
  isLiked: boolean = false;
  isBookmarked: boolean = false;
  newCommentContent: string = '';
  private destroy$ = new Subject<void>();
  private postId: number = 0;

  get currentUserAvatar(): string {
    return this.authService.getCurrentUser()?.avatar || this.post?.author?.avatar || '';
  }

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.postId = Number(params['id']);
        if (this.postId) {
          this.loadPostDetails(this.postId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPostDetails(postId: number): void {
    this.loading = true;

    // Load post from DEV.TO API
    this.dataService.getPostById(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          if (post) {
            this.post = post;

            // The author is already included in the post from the API
            // but we can make a separate call to get more author details if needed
            if (post.author.username) {
              this.dataService.getUserByUsername(post.author.username)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: user => {
                    if (user) {
                      this.author = user;
                    }
                  },
                  error: err => console.error('Error fetching author details:', err)
                });
            }

            // Load related posts by tag (get the first tag if available)
            if (post.tags && post.tags.length > 0) {
              this.loadRelatedPostsByTag(post.tags[0], postId);
              this.recommendedTags = [...post.tags];
            }

            // Load comments
            this.loadComments(postId);
          } else {
            // Handle case when post is not found
            console.error('Post not found');
            this.router.navigate(['/']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching post:', error);
          this.loading = false;
          this.router.navigate(['/']);
        }
      });
  }

  loadComments(postId: number): void {
    // DEV.TO API doesn't provide comments directly, so we're using our existing mock data
    this.dataService.getCommentsByPost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (error) => {
          console.error('Error fetching comments:', error);
        }
      });
  }

  loadRelatedPostsByTag(tag: string, currentPostId: number): void {
    this.dataService.getPostsByTag(tag)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          // Filter out the current post and limit to 3 related posts
          this.relatedPosts = posts
            .filter(post => post.id !== currentPostId)
            .slice(0, 3);
        },
        error: (error) => {
          console.error('Error fetching related posts:', error);
          this.relatedPosts = [];
        }
      });
  }

  likePost(): void {
    if (this.post && !this.isLiked) {
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

  bookmarkPost(): void {
    if (this.post && !this.isBookmarked) {
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

  submitComment(): void {
    if (!this.post || !this.newCommentContent.trim()) return;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const newComment: Omit<Comment, 'id'> = {
      postId: this.post.id,
      content: this.newCommentContent.trim(),
      publishedDate: new Date(),
      likes: 0,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      }
    };

    this.dataService.createComment(newComment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comment) => {
          this.comments.unshift(comment);
          this.newCommentContent = '';
          if (this.post) {
            this.post.comments += 1;
          }
        },
        error: (error) => console.error('Error posting comment:', error)
      });
  }

  followAuthor(): void {
    if (!this.post?.author.username) {
      return;
    }

    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.router.navigate(['/user', this.post.author.username]);
  }

  likeComment(commentId: number): void {
    this.dataService.likeComment(commentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedComment) => {
          if (updatedComment) {
            const index = this.comments.findIndex(c => c.id === commentId);
            if (index !== -1) {
              this.comments[index] = updatedComment;
            }
          }
        },
        error: (error) => console.error('Error liking comment:', error)
      });
  }
}
