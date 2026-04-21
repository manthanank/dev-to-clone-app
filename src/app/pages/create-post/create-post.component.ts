import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataService } from '../../shared/data.service';
import { Post } from '../../models/post.interface';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
  imports: [FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePostComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly postForm = signal<FormGroup>(null!);
  readonly submitting = signal<boolean>(false);

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {}

  initForm(): void {
    this.postForm.set(this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      coverImage: [''],
      content: ['', [Validators.required]],
      tags: [''],
      excerpt: ['', [Validators.maxLength(200)]]
    }));
  }

  submitPost(): void {
    const form = this.postForm();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = form.value;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.submitting.set(false);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/new' } });
      return;
    }
    
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
      readingTime: Math.ceil(formValue.content.split(' ').length / 200),
      likes: 0,
      comments: 0,
      bookmarks: 0,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        bio: currentUser.bio || '',
        username: currentUser.username
      }
    };

    this.dataService.createPost(newPost)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (post) => {
          this.submitting.set(false);
          this.router.navigate(['/post', post.id]);
        },
        error: (err) => {
          console.error('Error creating post:', err);
          this.submitting.set(false);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
