import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, ReplaySubject, filter, map } from 'rxjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { UserAuthService } from '../../../common/services/user-auth.service';
import { EnvConfigService } from '../../../common/services/env-config.service';

@Injectable({
  providedIn: 'root'
})
export class NewsscrapingService {

  apiBaseUrl = '';

  public responseChunks = new ReplaySubject();
  private ctrl: AbortController = new AbortController();

  constructor(private http: HttpClient, private userAuthSer: UserAuthService, private envConfig: EnvConfigService) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
    this.getArticlesList()
  }

  getArticlesList() {
    const headers = new HttpHeaders()
      .set('organization-id', this.userAuthSer.getOrgId()!)
    return this.http.get(`${this.apiBaseUrl}/news-scraper/articles`, { headers })
  }
}
