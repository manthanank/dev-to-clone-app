import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/api-config.service';

interface VideoItem {
  image: string;
  duration: string;
  title: string;
  meta: string;
}

@Component({
    selector: 'app-videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss'],
    standalone: false
})
export class VideosComponent {
  videos: VideoItem[] = [];

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.http.get<any[]>(`${this.apiConfig.apiUrl}/articles?tag=video&per_page=12`, { headers: this.apiConfig.getHeaders() }).subscribe(data => {
      this.videos = (data || []).map(item => ({
        image: String(item.cover_image || item.social_image || ''),
        duration: `${item.reading_time_minutes || 1} min`,
        title: String(item.title || ''),
        meta: `${item.positive_reactions_count || 0} reactions • ${new Date(item.published_at).toLocaleDateString()}`
      }));
    });
  }

}
