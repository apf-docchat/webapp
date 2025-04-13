import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAuthService } from '../../../common/services/user-auth.service';
import { EnvConfigService } from '../../../common/services/env-config.service';
import { DocChatSchemaWithCollectionId, DocChatSchemaWithID } from '../../../common/models/doc_chat.model';

@Injectable({
  providedIn: 'root'
})
export class FileProcessorService {
  apiBaseUrl = '';
  constructor(
    private http: HttpClient,
    private userAuthSer: UserAuthService,
    private envConfig: EnvConfigService
  ) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
  }

  getDocGuideFiles() {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/doc-guide/files`, { headers });
  }

  getDocGuideCollectionFiles() {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/doc-guide/collection-files`, { headers });
  }

  getCustomInstruction(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/custom-instruction?collection_id=${collectionId}`, { headers });
  }

  generateCustomInstructions(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/custom-instruction-generate`, { "collection_id": collectionId}, { headers });
  }

  saveCustomInstruction(collectionData: { collection_id: number, custom_instruction: string }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.put(`${this.apiBaseUrl}/file-processor/custom-instruction`, collectionData, { headers });
  }

  getMetaDataStatus(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/metadata/status?collection_id=${collectionId}`, { headers });
  }

  // saveMetaDataString(metaData: { collection_id: number, content?: string, is_process_remainig: boolean } | { collection_id: number, is_process_remainig: boolean }) {
  //   const headers = new HttpHeaders().set(
  //     'organization-id',
  //     this.userAuthSer.getOrgId()!
  //   );
  //   return this.http.post(`${this.apiBaseUrl}/file-processor/metadata/update`, metaData, { headers });
  // }
  downloadMetaData(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/metadata/download?collection_id=${collectionId}`, { headers });
  }

  getChatInstructionValue(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/collection-rule?collection_id=${collectionId}`, { headers });
  }

  updateChatInstructionValue(instructionData: {
    "collection_id": number,
    "collection_rules": string[]
  }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.put(`${this.apiBaseUrl}/file-processor/collection-rule`, instructionData, { headers });
  }

  // New Metadata API
  getMetaDataSchemaValue(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/metadata-schema?collection_id=${collectionId}`, { headers });
  }

  generateMetadata(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/metadata-schema-generate`, { "collection_id": collectionId}, { headers });
  }

  addMetaDataSchemaValue(metaData: DocChatSchemaWithCollectionId) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/metadata-schema`, metaData, { headers });
  }

  updateMetaDataSchemaValue(metaData: DocChatSchemaWithID) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.patch(`${this.apiBaseUrl}/file-processor/metadata-schema`, metaData, { headers });
  }

  deleteMetaDataSchemaValue(metaData: { schema_ids: number[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.delete(`${this.apiBaseUrl}/file-processor/metadata-schema`, { headers, body: metaData });
  }

  rearrangeMetaDataSchemaValue(metaData: {
    schema_id: number,
    weight_to: number,
    collection_id: number
  }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.patch(`${this.apiBaseUrl}/file-processor/metadata-schema/weight`, metaData, { headers });
  }

  getMetaDataFilesList(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/metadata?collection_id=${collectionId}`, { headers });
  }

  saveMetaData(metaData: { collection_id: number, file_ids?: number[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/metadata/update`, metaData, { headers });
  }
  getSummaryStatus(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/summarise/status?collection_id=${collectionId}`, { headers });
  }
  getSummaryContent(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/summarise?collection_id=${collectionId}`, { headers });
  }

  redoAllSummaries(metaData: { collection_id: number, is_process_remainig: boolean }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/summarise/update`, metaData, { headers });
  }

  downloadSummery(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/summarise/download?collection_id=${collectionId}`, { headers });
  }

  addFilesToDocGuide(documentList: { file_ids: number[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/doc-guide/process-file`, documentList, { headers });
  }

  deleteFilesToDocGuide(documentList: { file_ids: number[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.delete(`${this.apiBaseUrl}/file-processor/doc-guide/process-file`, { headers, body: documentList });
  }

  getFaqs(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/faq?collection_id=${collectionId}`, { headers });
  }

  addFaqQuestions(faqQuestions: { collection_id: number, questions: string[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.post(`${this.apiBaseUrl}/file-processor/faq`, faqQuestions, { headers });
  }

  editFaqQuestions(faqQuestions: { faq_id: number, question: string }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.patch(`${this.apiBaseUrl}/file-processor/faq`, faqQuestions, { headers });
  }

  deleteFaqQuestions(faqQuestions: { faq_ids: number[] }) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.delete(`${this.apiBaseUrl}/file-processor/faq`, { headers, body: faqQuestions });
  }

  downloadFaqQuestions(collectionId: number) {
    const headers = new HttpHeaders().set(
      'organization-id',
      this.userAuthSer.getOrgId()!
    );
    return this.http.get(`${this.apiBaseUrl}/file-processor/faq/download?collection_id=${collectionId}`, { headers });
  }
}
