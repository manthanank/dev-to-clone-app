import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../shared/data.service';
import { Post } from '../../models/post.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-reading-list',
    templateUrl: './reading-list.component.html',
    styleUrls: ['./reading-list.component.scss'],
    standalone: false
})
export class ReadingListComponent implements OnInit, OnDestroy {
  bookmarkedPosts: Post[] = [];
  loading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadBookmarks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookmarks(): void {
    this.loading = true;
    this.dataService.getBookmarkedPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.bookmarkedPosts = posts;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
          this.loading = false;
        }
      });
  }
}
