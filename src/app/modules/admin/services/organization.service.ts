import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvConfigService } from '../../../common/services/env-config.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiBaseUrl = '';

  constructor(
    private http: HttpClient,
    private envConfig: EnvConfigService,
  ) {
    this.apiBaseUrl = this.envConfig.envConfig.apiBaseUrl
  }

  createOrganization(orgName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { org_name: orgName };
    return this.http.post<any>(this.apiBaseUrl+'/admin/organization', body, { headers });
  }

  createUser(username: string, password: string, email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username: username, password: password, email: email };
    return this.http.post<any>(this.apiBaseUrl+'/admin/user', body, { headers });
  }

  getOrgList(): Promise<any> {
    return this.http.get(`${this.apiBaseUrl}/admin/organization`).toPromise();
  }

  getUserList(): Promise<any> {
    return this.http.get(`${this.apiBaseUrl}/admin/user`).toPromise();
  }

  getModuleList(organization_id: number) {
    const headers = new HttpHeaders()
      .set('organization-id', organization_id.toString());
    return this.http.get(`${this.apiBaseUrl}/module`, { headers })
  }

  getPrompts(): Promise<any> {
    /* const headers = new HttpHeaders()
      .set('organization-id', organization_id.toString()); */
    return this.http.get(`${this.apiBaseUrl}/admin/prompt`/* , { headers } */).toPromise();
  }

  savePrompt(prompt: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      id: prompt.id,
      prompt_name: prompt.prompt_name,
      name_label: prompt.name_label,
      prompt_text: prompt.prompt_text,
      description: prompt.description,
      prompt_type: prompt.prompt_type
    };
    return this.http.post<any>(`${this.apiBaseUrl}/admin/prompt`, body, { headers });
  }

  saveOrgName(orgId: string, orgName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { org_id: orgId, org_name: orgName };
    return this.http.post<any>(`${this.apiBaseUrl}/admin/organization/name`, body, { headers });
  }

  saveUserName(id: string, username: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { id: id, username: username };
    return this.http.post<any>(`${this.apiBaseUrl}/admin/user/username`, body, { headers });
  }

  saveEmail(id: string, email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { id: id, email: email };
    return this.http.post<any>(`${this.apiBaseUrl}/admin/user/email`, body, { headers });
  }

  addModulesToOrganization(orgId: string, moduleListCsv: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { org_id: orgId, module_list_csv: moduleListCsv };
    return this.http.post<any>(`${this.apiBaseUrl}/admin/organization/module`, body, { headers });
  }

  getIssues(): Promise<any> {
    const url = `${this.apiBaseUrl}/admin/issues`;
    const orgId = localStorage.getItem('orgId') || '';
    const headers = new HttpHeaders().set(
      'organization-id',
      orgId
    );
    return this.http.get(url /* , { headers } */).toPromise();
  }
  
  updateUserIssue(id: string, userIssue: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { id: id, user_issue: userIssue};
    return this.http.post<any>(`${this.apiBaseUrl}/admin/issues`, body, { headers });
  }

  getChatLog(thread_id: string): Promise<any> {
    const url = `${this.apiBaseUrl}/admin/thread/${thread_id}`;
    const orgId = localStorage.getItem('orgId') || '';
    const headers = new HttpHeaders().set(
      'organization-id',
      orgId
    );
    return this.http.get(url /* , { headers } */).toPromise();
  }

  populateDashboard(orgId: string): Promise<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/admin/collection/dashboard/${orgId}`, {  }).toPromise();   
  }
}