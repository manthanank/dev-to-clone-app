import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/api-config.service';

interface ListingItem {
  type: string;
  title: string;
  description: string;
  org: string;
  action: string;
  url: string;
}

@Component({
    selector: 'app-listings',
    templateUrl: './listings.component.html',
    styleUrls: ['./listings.component.scss']
})
export class ListingsComponent {
  listings: ListingItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.http.get<any[]>(`${this.apiConfig.apiUrl}/listings`, { headers: this.apiConfig.getHeaders() }).subscribe(data => {
      this.listings = (data || []).map(item => ({
        type: String(item.category || 'Listing'),
        title: String(item.title || ''),
        description: String(item.body_markdown || item.description || '').slice(0, 180),
        org: String(item.organization?.name || item.user?.name || ''),
        action: 'View',
        url: String(item.url || item.path || '')
      }));
    });
  }

  openApply(): void {
    this.router.navigate(['/about']);
  }

  openMentorship(): void {
    this.router.navigate(['/about']);
  }

  handleAction(listing: ListingItem): void {
    if (listing?.url) {
      window.open(listing.url, '_blank', 'noopener');
      return;
    }

    if (listing.action.toLowerCase().includes('apply')) {
      this.openApply();
      return;
    }

    this.openMentorship();
  }

}
