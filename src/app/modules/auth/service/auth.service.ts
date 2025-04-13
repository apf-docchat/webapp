import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvConfigService } from '../../../common/services/env-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiBaseUrl = '';

  constructor(private http: HttpClient, private envConfig: EnvConfigService) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
  }

  login(data: any) {
    return this.http.post(`${this.apiBaseUrl}/login`, data)
  }

  msLogin() {
    window.open(`${this.apiBaseUrl}/loginms365`, '_self');
  }
}
