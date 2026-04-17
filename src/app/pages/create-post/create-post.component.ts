import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DataService } from '../../shared/data.service';
import { Post } from '../../models/post.interface';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  submitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      coverImage: [''],
      content: ['', [Validators.required]],
      tags: [''],
      excerpt: ['', [Validators.maxLength(200)]]
    });
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValue = this.postForm.value;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.submitting = false;
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/new' } });
      return;
    }
    
    // Process tags (comma-separated string to array)
    const tagsArray = formValue.tags 
      ? formValue.tags.split(',').map((tag: string) => tag.trim().replace('#', ''))
      : [];

    const newPost: Omit<Post, 'id'> = {
      title: formValue.title,
      coverImage: formValue.coverImage,
      content: formValue.content,
      excerpt: formValue.excerpt || formValue.content.substring(0, 150) + '...',
      tags: tagsArray,
      publishedDate: new Date(),
      readingTime: Math.ceil(formValue.content.split(' ').length / 200), // Approx reading time
      likes: 0,
      comments: 0,
      bookmarks: 0,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        bio: currentUser.bio,
        username: currentUser.username
      }
    };

    this.dataService.createPost(newPost)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          this.submitting = false;
          this.router.navigate(['/post', post.id]);
        },
        error: (err) => {
          console.error('Error creating post:', err);
          this.submitting = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
