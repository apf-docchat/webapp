import { Injectable, signal } from '@angular/core';
import { ACCESS_TOKEN, ORG_ID } from '../constants';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { UserAuthService } from './user-auth.service';
import { Collection } from '../models/collection.model';
import { EnvConfigService } from './env-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  collectionList = signal<Collection[]>([])
  apiBaseUrl = '';

  constructor(private http: HttpClient, private userAuthSer: UserAuthService, private envConfig: EnvConfigService) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
  }

  addCollection(collectionData: { name: string, description: string }) {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.post(`${this.apiBaseUrl}/collection/`, collectionData, { headers },);
    } else {
      return this.http.post(`${this.apiBaseUrl}/collection/`, collectionData, { },);
    }
  }

  editCollection(collectionData: { name: string, description: string }, collectionId: number) {
    const headers = new HttpHeaders().set('organization-id', this.userAuthSer.getOrgId()!);
    return this.http.put(`${this.apiBaseUrl}/collection/${collectionId}`, collectionData, { headers },);
  }

  deleteCollection(collectionId: number) {
    const headers = new HttpHeaders().set('organization-id', this.userAuthSer.getOrgId()!);
    return this.http.delete(`${this.apiBaseUrl}/collection/${collectionId}`, { headers },);
  }

  deleteFiles(collectionListId: { 'file_ids': string[] }) {
    const headers = new HttpHeaders().set('organization-id', this.userAuthSer.getOrgId()!);
    return this.http.delete(`${this.apiBaseUrl}/collection/file`, { headers, body: collectionListId },);
  }

  moveFiles(collectionData: { 'collection_id': number, 'file_ids': string[] }) {
    const headers = new HttpHeaders().set('organization-id', this.userAuthSer.getOrgId()!);
    return this.http.patch(`${this.apiBaseUrl}/collection/file/move-file`, collectionData, { headers },);
  }

  uploadFile(fileUrl: any) {
    const headers = new HttpHeaders().set('organization-id', this.userAuthSer.getOrgId()!);
    return this.http.post(`${this.apiBaseUrl}/collection/file`, fileUrl, { headers },);
  }


  getUploadedFileList(queryString: string = ''): Observable<any> {

    const url = queryString ? `${this.apiBaseUrl}/collection/${queryString}` : `${this.apiBaseUrl}/collection`;
    
    const orgId = this.userAuthSer.getOrgId();
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(url, { headers }); 
    } else {
      const url = queryString ? `${this.apiBaseUrl}/collection/${queryString}` : `${this.apiBaseUrl}/collection`;
      return this.http.get(url, { });
    }
  }

  getCollectionsForAdmin(): Observable<any> {
    const url = `${this.apiBaseUrl}/collection/admin`;
    
    const orgId = this.userAuthSer.getOrgId();
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(url, { headers }); 
    } else {
      return this.http.get(url, { });
    }
  }

  downloadFile(queryString: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders().set('organization-id',
      this.userAuthSer.getOrgId()!);
    return this.http.get(`${this.apiBaseUrl}/collection/file${queryString}`, { headers, responseType: 'blob', observe: 'response'  });
  }

  downloadCollection(queryString: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders().set('organization-id',
      this.userAuthSer.getOrgId()!);
    return this.http.get(`${this.apiBaseUrl}/collection/files${queryString}`, { headers, responseType: 'blob', observe: 'response'  });
  }

  getColumns(collectionId: number, tableName: string): Observable<any> {
    const headers = new HttpHeaders().set('organization-id',
      this.userAuthSer.getOrgId()!);
    return this.http.get(`${this.apiBaseUrl}/collection/${collectionId}/columns/${tableName}`, { headers });
  }

  getInsightsList(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.get(`${this.apiBaseUrl}/collection/insights/list/${collectionId}`, { headers });
  }

  getInsight(collectionId: number, id: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.get(`${this.apiBaseUrl}/collection/insights/${collectionId}/${id.toString()}`, { headers });
  }

  addInsight(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.post(`${this.apiBaseUrl}/collection/insights/${collectionId}`, {} , { headers });
  }

  updateInsight(collectionId: number, id: string, query: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.patch(`${this.apiBaseUrl}/collection/insights/${collectionId}/${id}`, {"query": query} , { headers });
  }

  deleteInsight(collectionId: number, id: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.delete(`${this.apiBaseUrl}/collection/insights/${collectionId}/${id}`, { headers });
  }

  /* getJobsList(collectionId: number | string = '') {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );

    return this.http.get(`${this.apiBaseUrl}/jobs?collection_id=${collectionId}`, { headers });
  } */
  getJobsList() {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(`${this.apiBaseUrl}/jobs`, { headers });
    } else {
      return this.http.get(`${this.apiBaseUrl}/jobs`, { });
    }
  }

  getJob(id: number, inputParams: string = '') {
    let url = `${this.apiBaseUrl}/jobs/${id}`;
    if (inputParams) {
      url += `?input_params=${encodeURIComponent(inputParams)}`;
    }

    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(url, { headers });
    } else {
      return this.http.get(url, { });
    }
  }

  getStep(id: number, stepId: number, inputParams: string = '') {
    let url = `${this.apiBaseUrl}/jobs/${id}/steps/${stepId}`;
    // Add input_params as a query parameter if provided
    if (inputParams) {
      url += `?input_params=${encodeURIComponent(inputParams)}`;
    }

    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.get(url, { headers });
    } else {
      return this.http.get(url, { });
    }
  }

  addJob(username: string, collectionId: string = '') {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.post(`${this.apiBaseUrl}/jobs`, {"username": username, "job_collection_id": collectionId} , { headers });
    } else {
      return this.http.post(`${this.apiBaseUrl}/jobs`, {"username": username, "job_collection_id": collectionId} , { });
    }
  }

  createSteps(username: string, id: string, collectionId: number, query: string, apiEndpoint: string) {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.post(`${this.apiBaseUrl}/jobs/${id}/create-steps`, {"username": username, "job_collection_id": collectionId, "query": query, "api_endpoint": apiEndpoint} , { headers });
    } else {
      return this.http.post(`${this.apiBaseUrl}/jobs/${id}/create-steps`, {"username": username, "job_collection_id": collectionId, "query": query, "api_endpoint": apiEndpoint} , { });
    }    
  }

  updateJob(username: string, id: string, steps: string, apiEndpoint: string, jobCollectionId: string) {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.patch(`${this.apiBaseUrl}/jobs/${id}`, {"username": username, "steps": steps, "api_endpoint": apiEndpoint, "job_collection_id": jobCollectionId} , { headers });
    } else {
      return this.http.patch(`${this.apiBaseUrl}/jobs/${id}`, {"username": username, "steps": steps, "api_endpoint": apiEndpoint, "job_collection_id": jobCollectionId} , { });
    }        
  }

/*   updateStep(username: string, jobId: string, step: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    const step_json = JSON.parse(step);
    const stepId = step_json['id'];
    return this.http.patch(`${this.apiBaseUrl}/jobs/${jobId}/steps/${stepId}`, {"username": username, "step": step} , { headers });
  } */

  deleteJob(username: string, id: string) {
    let orgId = this.userAuthSer.getOrgId();
    if (orgId == null) {
      orgId = localStorage.getItem('orgId');
    }
    if (orgId != null && orgId != "0") {
      const headers = new HttpHeaders().set(
        'organization-id',
        orgId
      );
      return this.http.delete(`${this.apiBaseUrl}/jobs/${id}/${username}`, { headers });
    } else {
      return this.http.delete(`${this.apiBaseUrl}/jobs/${id}/${username}`, { });
    }
  }

 getRolesList(username: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/roles/list/${username}`, { headers });
  }

  getCurrentRole(username: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/roles/user/${username}`, { headers });
  }

  getRole(id: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/roles/${id}`, { headers });
  }

  addRole(roleData: any) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/roles`, roleData, { headers });
  }

  updateRole(id: number, roleData: any) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.patch(`${this.apiBaseUrl}/roles/${id}`, roleData, { headers });
  }

  deleteRole(id: number, username: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.delete(`${this.apiBaseUrl}/roles/${id}/${username}`, { headers });
  }

  updateUserRole(id: number, username: string) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.patch(`${this.apiBaseUrl}/roles/user/${username}/${id}`, {}, { headers });
  }
}
