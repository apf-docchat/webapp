import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { marked } from 'marked';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DocAnalysisService } from '../../services/file-list/docAnalysis.service';
import { DocAnalysisFileService } from '../../services/file-list/docAnalysis-file.service';
import { Subscription } from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';


@Component({
  selector: 'app-show-error-message',
  standalone: true,
  imports: [
    NzButtonModule,
    NzSpinModule,
    NzTableModule
  ],
  templateUrl: './show-error-message.component.html',
  styleUrl: './show-error-message.component.less'
})
export class ShowErrorMessageComponent {
  docAnalysisSer = inject(DocAnalysisService);
  docAnalysisFileSer = inject(DocAnalysisFileService);
  errorMessageObject: any = {};
  errorKeys: string[] = [];
  notification = inject(NzNotificationService)
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  selectedFile: any | null = null;

  chatResponse$: Subscription | null = null;

  uploadMessage: any[] = [];
  issues: any[] = [];
  ignoreError: boolean = false;
  selectedCollectionId = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    // this.errorMessageObject = this.nzModalData.errorMessageObject
    this.selectedFile = this.nzModalData.file
    this.errorKeys = Object.keys(this.errorMessageObject);
    for (const key of this.errorKeys) {
      this.messageSetMarked(this.errorMessageObject[key]).then(markedMessage => {
        this.errorMessageObject[key] = markedMessage;
      });
    }
    // this.getResponse(this.selectedFile, false);
    this.fileUpload();
  }

  async messageSetMarked(value: string): Promise<string> {
    return await marked(value);
  }

  fileUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.docAnalysisSer.fileUpload(formData).subscribe((res: any) => {
        if (res.temp_filepath) {
          this.getResponse(res.temp_filepath, this.ignoreError);
        }
      });
    }
  }

  getResponse(file: string, ignoreError: boolean) {
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }

    let selectedCollection = localStorage.getItem('selectedCollection') || ''
    this.selectedCollectionId = JSON.parse(selectedCollection)['collection_id']

    const data = {
      temp_filepath: file,
      ignore: ignoreError,
      collection_id: this.selectedCollectionId
    }
    this.docAnalysisFileSer.getResponse(data);
    this.chatResponse$ = this.docAnalysisFileSer.responseChunks.subscribe(async (response: any)  => { this.ngZone.run(async () => {
      console.log(response);

      if (response.event !== 'finalOutput') {
        // let responseData = JSON.parse(response.data);
        const markedResponse = await marked(response.data);
        if (response.event == 'progressEvent') {
          this.uploadMessage.push(markedResponse);
        } else {
          this.issues.push(JSON.parse(response.data));
        }
        this.cdr.detectChanges();

      } else {

        if (response.data) {
          let responseData = JSON.parse(response.data);
          this.ignoreError = !responseData.success;
          if (!this.ignoreError) {
            this.#modal.close(true)
            this.notification.success('Success', 'File uploaded successfully');
          } else {
              this.notification.create(
                'error',
                'Error',
                responseData.message || 'File upload failed',
                { nzPlacement: 'bottomLeft' }
              );
          }
        }
        // this.messageList[this.currentBotChatIndex - 1].progress = 0;
        // let responseData = JSON.parse(response.data)
        // if (responseData.thread_id) {
        //   this.threadId = responseData.thread_id;
        // }
        // const markedResponse = await marked(responseData.message);
        // this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        // if (responseData.faq_id) {
        //   this.messageList[this.currentBotChatIndex - 1].faq_id = responseData.faq_id
        // }
        // this.currentBotChatIndex = 0;
        // setTimeout(() => {
        //   this.scrollToLastMessage();
        // }, 1000);
        // this.stopTimer()
      }
    });
  });
  }

  close(retry: boolean): void {
    if (retry) {
      this.fileUpload();
    } else {
      this.#modal.close(false)
    }

  }
}
