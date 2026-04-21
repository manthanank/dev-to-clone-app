import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiKeyStorageKey = 'devto_api_key';
  private readonly apiUrlStorageKey = 'devto_api_url';

  get apiUrl(): string {
    const storedUrl = localStorage.getItem(this.apiUrlStorageKey)?.trim();
    return storedUrl || environment.apiUrl;
  }

  getApiKey(): string {
    const storedKey = localStorage.getItem(this.apiKeyStorageKey)?.trim();
    if (storedKey) return storedKey;
    return environment.apiKey || '';
  }

  setApiKey(apiKey: string): void {
    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      localStorage.removeItem(this.apiKeyStorageKey);
      return;
    }

    localStorage.setItem(this.apiKeyStorageKey, trimmedApiKey);
  }

  setApiUrl(apiUrl: string): void {
    const trimmedUrl = apiUrl.trim();
    if (!trimmedUrl) {
      localStorage.removeItem(this.apiUrlStorageKey);
      return;
    }

    localStorage.setItem(this.apiUrlStorageKey, trimmedUrl);
  }

  getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const apiKey = this.getApiKey();
    // Only set the header if apiKey is not empty
    if (apiKey && apiKey.length > 0) {
      headers = headers.set('api-key', apiKey);
    }

    return headers;
  }
}
