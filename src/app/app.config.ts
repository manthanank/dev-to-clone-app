import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withScrollPositionRestoration } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withScrollPositionRestoration('enabled')),
    provideHttpClient(withFetch())
  ]
};
