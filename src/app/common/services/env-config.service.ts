import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvConfigService {
  private config: any;
  constructor(private http: HttpClient) { }

  async loadConfig() {
    const data = await lastValueFrom(this.http.get('assets/envconfig.json'));
    this.config = data;
  }

  get envConfig() {
    return this.config;
  }

  get apiBaseUrl() {
    const apiUrl = this.config.apiBaseUrl;
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  }
}
