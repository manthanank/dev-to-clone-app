import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/api-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PodcastItem {
  title: string;
  meta: string;
  description: string;
  theme: 'primary' | 'blue';
}

@Component({
  selector: 'app-podcasts',
  templateUrl: './podcasts.component.html',
  styleUrls: ['./podcasts.component.css'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PodcastsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly podcasts = signal<PodcastItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadPodcasts();
  }

  private loadPodcasts(): void {
    this.loading.set(true);
    this.http.get<any[]>(`${this.apiConfig.apiUrl}/podcast_episodes`, { 
      headers: this.apiConfig.getHeaders() 
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        const mappedPodcasts = (data || []).map((item, index) => ({
          title: String(item.title || ''),
          meta: `${item.podcast?.title || 'Podcast'} • ${item.podcast?.slug || ''}`,
          description: String(item.description || '').slice(0, 220).replace(/<[^>]*>/g, ''), // Strip HTML if any
          theme: index % 2 === 0 ? 'primary' as const : 'blue' as const
        }));
        this.podcasts.set(mappedPodcasts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching podcasts:', err);
        this.loading.set(false);
      }
    });
  }

  listenPodcast(): void {
    this.router.navigate(['/about']);
  }
}
