import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private configUrl = '/assets/envconfig.json';
  private config: any = {};

  constructor(private http: HttpClient) {}
  
  loadConfig(): Observable<void> {
    return this.http.get(this.configUrl).pipe(
      map((config: any) => {
        this.config = config;
      })
    );
  }

  getLogoUrl(): string {
    return this.config.logoUrl || '/assets/brand-assets/default-logo.png';
  }

  setLogoUrl(url: string): void {
    this.config.logoUrl = url;
  }

  getThemeConfig(): any {
    return {
      nzPrimaryColor: this.config.nzPrimaryColor || '#db1414',
      backgroundColor1: this.config.backgroundColor1 || '#c2878755',
      backgroundColor2: this.config.backgroundColor2 || '#c28787',
      folderIconColor: this.config.folderIconColor || '#db1414',
      highlightBackgroundColor: this.config.highlightBackgroundColor || '#dc9898'
    };
  }
}