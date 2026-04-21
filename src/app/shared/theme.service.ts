import { Injectable, Renderer2, RendererFactory2, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer: Renderer2;
  
  private readonly _isDarkMode = signal<boolean>(false);
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  toggleTheme(): void {
    if (this._isDarkMode()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode(): void {
    this.renderer.addClass(document.documentElement, 'dark');
    localStorage.setItem('theme', 'dark');
    this._isDarkMode.set(true);
  }

  private disableDarkMode(): void {
    this.renderer.removeClass(document.documentElement, 'dark');
    localStorage.setItem('theme', 'light');
    this._isDarkMode.set(false);
  }
}
