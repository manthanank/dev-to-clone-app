import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/api-config.service';

interface PodcastItem {
  title: string;
  meta: string;
  description: string;
  theme: 'primary' | 'blue';
}

@Component({
  selector: 'app-podcasts',
  templateUrl: './podcasts.component.html',
  styleUrls: ['./podcasts.component.scss']
})
export class PodcastsComponent {
  podcasts: PodcastItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.http.get<any[]>(`${this.apiConfig.apiUrl}/podcast_episodes`, { headers: this.apiConfig.getHeaders() }).subscribe(data => {
      this.podcasts = (data || []).map((item, index) => ({
        title: String(item.title || ''),
        meta: `${item.podcast?.title || 'Podcast'} • ${item.podcast?.slug || ''}`,
        description: String(item.description || '').slice(0, 220),
        theme: index % 2 === 0 ? 'primary' : 'blue'
      }));
    });
  }

  listenPodcast(): void {
    this.router.navigate(['/about']);
  }

}
