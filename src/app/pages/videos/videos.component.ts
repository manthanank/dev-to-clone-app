import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/api-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';

interface VideoItem {
  image: string;
  duration: string;
  title: string;
  meta: string;
}

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly videos = signal<VideoItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadVideos();
  }

  private loadVideos(): void {
    this.loading.set(true);
    this.http.get<any[]>(`${this.apiConfig.apiUrl}/articles?tag=video&per_page=12`, { 
      headers: this.apiConfig.getHeaders() 
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        const mappedVideos = (data || []).map(item => ({
          image: String(item.cover_image || item.social_image || ''),
          duration: `${item.reading_time_minutes || 1} min`,
          title: String(item.title || ''),
          meta: `${item.positive_reactions_count || 0} reactions • ${new Date(item.published_at).toLocaleDateString()}`
        }));
        this.videos.set(mappedVideos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching videos:', err);
        this.loading.set(false);
      }
    });
  }
}
