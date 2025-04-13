import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserAuthService } from '../../../common/services/user-auth.service';
import { EnvConfigService } from '../../../common/services/env-config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  apiBaseUrl = '';

  constructor(private http: HttpClient, private userAuthSer: UserAuthService, private envConfig: EnvConfigService) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
  }

  ngOnInit() {
  }

  getOrgList(): Promise<any> {
    return this.http.get(`${this.apiBaseUrl}/organization`).toPromise();
  }

  getModuleList() {
    const orgId = this.userAuthSer.getOrgId();
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(`${this.apiBaseUrl}/module`, { headers })
    } else {
      return this.http.get(`${this.apiBaseUrl}/module`, { })
    }
  }

  getChatList() {

    return this.http.get(`${this.apiBaseUrl}/test2`)
  }
}