import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { UserAuthService } from '../../../../common/services/user-auth.service';
import { Observable, ReplaySubject, filter, map } from 'rxjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { EnvConfigService } from '../../../../common/services/env-config.service';

class RetriableError extends Error {}
class FatalError extends Error {}

@Injectable({
  providedIn: 'root',
})
export class DocChatService {
  apiBaseUrl = '';
  currentCollection = signal<any | null>(null);

  public responseChunks = new ReplaySubject();
  private ctrl: AbortController = new AbortController();

  constructor(
    private http: HttpClient,
    private userAuthSer: UserAuthService,
    private envConfig: EnvConfigService
  ) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
  }

  getChatInstructionValue(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/collection-rule?collection_id=${collectionId}`, { headers });
  }


  // Stops any in-progress chat response
  stopStream() {
    this.ctrl.abort();
    this.ctrl = new AbortController();
    this.responseChunks.complete();
    this.responseChunks.unsubscribe()
    this.responseChunks = new ReplaySubject();
  }

  async getResponse(message: string, collection_id: number, thread_id: string) {
    if (!this.ctrl) {
      this.ctrl = new AbortController();
    }

    fetchEventSource(`${this.apiBaseUrl}/doc-chat/chat`, {
      openWhenHidden: true,
      method: 'POST',
      headers: {
        'organization-id': this.userAuthSer.getOrgId()!,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.userAuthSer.getUserToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        "user_query": message,
        "collection_id": collection_id,
        "thread_id": thread_id
        // "type": "docchat",
        // "search_type": "default",
        // "new_chat": isNewChat
      }),
      signal: this.ctrl.signal,
      onmessage: (msg) => {
        this.responseChunks.next(msg);
        if (msg.event === 'finalOutput') {
          this.responseChunks.complete();
          this.stopStream()
        }
      },
      onclose: () => {
        this.responseChunks.complete();
        this.stopStream()
        // if the server closes the connection unexpectedly, retry:
        // throw new RetriableError();
      },
      onerror(err) {
        // handleError(err)
      },
    });
  }

  handleError(error: any) {
    console.error('Error:', error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request was aborted');
    } else if (
      error instanceof TypeError &&
      error.message === 'Failed to fetch'
    ) {
      throw new Error('Network error occurred');
    } else if (
      error instanceof TypeError &&
      error.message === 'Failed to decode'
    ) {
      throw new Error('Error decoding response from server');
    } else if (
      error instanceof TypeError &&
      error.message ===
      'JSON.parse: unexpected end of data at line 1 column 1 of the JSON data'
    ) {
      throw new Error('Invalid JSON response from server');
    } else if (
      error instanceof TypeError &&
      error.message ===
      'response.body?.pipeThrough(...).getReader is not a function'
    ) {
      throw new Error('Invalid response from server');
    } else {
      throw new Error('Unknown error occurred');
    }
  }

  getMetadataSearch(message: string, collection_id: number, isNewChat: string) {
    const body = {
      "user_text": message,
      "collection_id": collection_id,
      "type": "docchat",
      "search_type": "metasearch",
      "new_chat": isNewChat
    }
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/doc-chat/chat`, body, { headers });
  }
  getImprovedSearch(collection_id: number, faq_id: number, thread_id: string) {
    if (!this.ctrl) {
      this.ctrl = new AbortController();
    }

    fetchEventSource(`${this.apiBaseUrl}/doc-chat/faq/update`, {
      openWhenHidden: true,
      method: 'POST',
      headers: {
        'organization-id': this.userAuthSer.getOrgId()!,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.userAuthSer.getUserToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        "collection_id": collection_id,
        "thread_id": thread_id,
        "faq_id": faq_id
      }),
      signal: this.ctrl.signal,
      onmessage: (msg) => {
        this.responseChunks.next(msg);
        if (msg.event === 'finalOutput') {
          this.responseChunks.complete();
          this.stopStream()
        }
      },
      onclose: () => {
        this.responseChunks.complete();
        this.stopStream()
        // if the server closes the connection unexpectedly, retry:
        // throw new RetriableError();
      },
      onerror(err) {
        // handleError(err)
      },
    });
  }

}
