import { Component, ElementRef, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

import { DocChatService } from '../../services/file-list/docChat.service';
import { Subject, Subscription, interval } from 'rxjs';
import { ModelReferenceComponent } from '../model-reference/model-reference.component';
import { Collection } from '../../../../common/models/collection.model';
import { marked } from 'marked';
import { USERNAME } from '../../../../common/constants';

type MessageType = 'default' | 'metasearch';

type Message = { index: number, message: string, isOwnerMe: boolean, metaData?: string, searchType?: string, faq_id?: number, progress?: number, table?: boolean, image_data?: string }

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzProgressModule,
    NzSwitchModule,
    NzAvatarModule,
    NzSelectModule,
    NzTableModule,
    NzDividerModule,
    NzCollapseModule
  ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.less'
})
export class ChatScreenComponent {
  private subscription!: Subscription;

  @Input() collection!: Collection;
  @Output() newChat = new EventEmitter<null>();

  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  private filesListService = inject(DocChatService);
  chatInstructionsList: string[] = [];
  currentBotChatIndex: number = 0;
  size: NzButtonSize = 'large';
  question: string = '';
  chatResponse$: Subscription | null = null;
  threadId: string = '';

  messageList: Message[] = []
  querySuggestions: string[] = [];

  private countdownSubscription!: Subscription;
  remainingTime: number = 60;

  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChildren('chatMessage') chatMessages!: QueryList<any>;
  @ViewChild('issueFormTemplate', { static: true }) issueFormTemplate!: TemplateRef<any>;


  modalRef!: NzModalRef;
  issueForm!: FormGroup;
  fields: any[] = [];  
  issueData: any = {};
  issueFormFields: any = {};
  //filterForm!: FormGroup;

  fileList: any[] = [{
    "file_id": "",
    "file_name": "Select All",
    "file_url": "",
    "file_upload_datetime": ""
  }];
  selectedFileIds: string[] | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private modal: NzModalService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
  ) {}

  ngOnInit() {
    this.getChatInstructionsValue();
    this.issueForm = this.fb.group({
      issue: ['', Validators.required]
    });
    this.initializeIssueForm();
    //this.initializeFilterForm();

    const selectedCollection = localStorage.getItem('selectedCollection');
    if (selectedCollection) {
      this.fileList = JSON.parse(selectedCollection).files;
      this.fileList.unshift({
        "file_id": "",
        "file_name": "Select All",
        "file_url": "",
        "file_upload_datetime": ""
      });
    }
  }

  ngAfterViewInit() {
    this.chatMessages.changes.subscribe(() => {
      if (this.currentBotChatIndex != 0) {
        this.scrollToLastMessage();
      }
    });
  }

  initializeIssueForm(): void {
    this.filesListService.getConfiguration('issues').subscribe(
    (response: any) => {
      const jsonSchema = response.data.config;
      this.issueFormFields = JSON.parse(jsonSchema);
      this.fields = this.issueFormFields.fields.filter((field: { name: string; }) => ['title', 'description'].includes(field.name));

      const formControls = this.fields.reduce((acc, field) => {
        const validators = field.required ? [Validators.required] : [];
        acc[field.name] = [null, validators];
        return acc;
      }, {});

      formControls['status'] = ['Open'];
      this.issueForm = this.fb.group(formControls);
    });
  }

  /* initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      date: [''],
      status: ['']
    });
  } */

  /* applyFilters(): void {
    const filters = this.filterForm.value;
    console.log('Filters applied:', filters);
    // Logic to apply filters to the chat messages
  } */

  scrollToLastMessage() {
    const messagesContainer = this.messagesContainer.nativeElement;
    const lastMessage = this.chatMessages.last?.nativeElement;

    if (lastMessage) {
      const lastMessageRect = lastMessage.getBoundingClientRect();
      const containerRect = messagesContainer.getBoundingClientRect();

      if (lastMessageRect.bottom > containerRect.bottom) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }

  ngAfterViewChecked() {
    if (this.currentBotChatIndex != 0) {
      this.scrollToLastMessage();
    }
  }

  getChatInstructionsValue(): void {
    this.filesListService.getChatInstructionValue(this.collection!.collection_id).subscribe((res: any) => {
      this.chatInstructionsList = res.data;
    }
    )
  }

  getResponse(query: any,) {
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }
    if (this.selectedFileIds && this.selectedFileIds.includes('')) { // If 'Select All' is selected
      this.selectedFileIds = null;
    }
    this.filesListService.getResponse(query, this.collection.collection_id, this.threadId, this.selectedFileIds);
    this.chatResponse$ = this.filesListService.responseChunks.subscribe(async (response: any) => {
      console.log('Response:', response);
      let responseData = JSON.parse(response.data);
      if (response.event !== 'finalOutput') {
        if (response.event === 'progressOutput') {
          this.messageList[this.currentBotChatIndex - 1].progress = responseData.progress_percentage;
        } else if (response.event === 'progressEvent') {
          const markedResponse = await marked(responseData.message);
          this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        } else {
          this.messageList[this.currentBotChatIndex - 1].message += responseData.message
        }

      } else {
        this.messageList[this.currentBotChatIndex - 1].progress = 0;
        if (responseData.thread_id) {
          this.threadId = responseData.thread_id;
        }
        const markedResponse = await marked(responseData.message);
        this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        if (markedResponse.includes('<table')) {
          this.messageList[this.currentBotChatIndex - 1].table = true;
        } else {
          this.messageList[this.currentBotChatIndex - 1].table = false;
        }
        if (responseData.faq_id) {
          this.messageList[this.currentBotChatIndex - 1].faq_id = responseData.faq_id
          console.log(`for faq_id: ${this.messageList[this.currentBotChatIndex - 1].faq_id}`);
        }
        if (responseData.image_data) {
          this.messageList[this.currentBotChatIndex - 1].image_data = responseData.image_data;
        }
        this.currentBotChatIndex = 0;
        setTimeout(() => {
          this.scrollToLastMessage();
        }, 1000);
        this.stopTimer()

        //Get query suggestions
        this.filesListService.getQuerySuggestions(query, this.collection.collection_id, this.threadId, this.selectedFileIds).subscribe((res: any) => {
          this.querySuggestions = res.message;
        });
      }
    });
  }

  sendMessage() {
    if (this.question !== '' && this.currentBotChatIndex == 0) {
      this.messageList.push({
        index: this.messageList.length + 1,
        message: this.question,
        isOwnerMe: true,

      })

      this.currentBotChatIndex = this.messageList.length + 1
      this.startTimer()
      this.messageList.push({
        index: this.currentBotChatIndex,
        message: '',
        isOwnerMe: false,

      })
      this.getResponse(this.question);
      this.question = '';
    }
  }

  useSuggestedQuestion(suggestion: string) {
    this.question = suggestion;
  }

  startTimer() {
    const countdown$ = interval(1000); // Emits a value every second
    this.countdownSubscription = countdown$.subscribe(() => {
      this.remainingTime--;
      if (this.remainingTime < 0) {
        this.countdownSubscription.unsubscribe();
      }
    });
  }
  stopTimer() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.remainingTime = 60;
    }
  }

  stopInprogressChat() {
    this.abortGetMetadataSearch();
    this.messageList.pop()
    this.currentBotChatIndex = 0;
  }

  retryChat() {
    const lastQuestion = this.messageList.slice().reverse().find((element: Message) => element.isOwnerMe === true);

    if (lastQuestion) {
      const copyOflastQuestion = JSON.parse(JSON.stringify(lastQuestion));
      this.currentBotChatIndex = 0;
      this.currentBotChatIndex = this.messageList.length + 1
      copyOflastQuestion.index = this.currentBotChatIndex
      this.messageList.push(copyOflastQuestion)

      this.currentBotChatIndex = this.messageList.length + 1
      this.messageList.push({
        index: this.currentBotChatIndex,
        message: '',
        isOwnerMe: false,
      })

      this.startTimer()
      this.getResponse(this.messageList[this.messageList.length - 2].message);
      this.question = '';
    }
  }

  negativeFeedback(index: number) {
    console.log('Negative feedback clicked for index:', index);
    const lastQuestion = this.messageList.slice().reverse().find((element: Message) => element.index === index-1);
    console.log('Last question:', lastQuestion);
    console.log(this.messageList);

    if (lastQuestion) {
      const copyOflastQuestion = JSON.parse(JSON.stringify(lastQuestion));
      this.currentBotChatIndex = 0;
      this.currentBotChatIndex = this.messageList.length + 1
      copyOflastQuestion.index = this.currentBotChatIndex
      this.messageList.push(copyOflastQuestion)

      this.currentBotChatIndex = this.messageList.length + 1
      this.messageList.push({
        index: this.currentBotChatIndex,
        message: '',
        isOwnerMe: false,
      })

      this.startTimer()
      console.log("Faq id: ", this.messageList[index-1].faq_id);
      if (this.messageList[index-1].faq_id != 0) {
        this.filesListService.deleteFaq(this.messageList[index-1].faq_id).subscribe((res: any) => {
          console.log('FAQ deleted:', res);
          this.getResponse(this.messageList[this.messageList.length - 2].message);
          this.question = '';
        });
      }
    }
  }

  improveChat(faq_id: number) {
    this.currentBotChatIndex = this.messageList.length + 1
    this.messageList.push({
      index: this.currentBotChatIndex,
      message: '',
      isOwnerMe: false,
      searchType: 'metaSearch'
    })

    this.startTimer()
    this.improvedChatApi(faq_id)
    this.question = ''
  }

  improvedChatApi(faq_id: number) {


    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }
    this.filesListService.getImprovedSearch(this.collection.collection_id, faq_id, this.threadId);
    this.chatResponse$ = this.filesListService.responseChunks.subscribe(async (response: any) => {
      if (response.event !== 'finalOutput') {

        if (response.event === 'progressOutput') {
          let responseData = JSON.parse(response.data);
          this.messageList[this.currentBotChatIndex - 1].progress = responseData.progress_percentage;
        } else {
          this.messageList[this.currentBotChatIndex - 1].message += response.data
        }

      } else {
        this.messageList[this.currentBotChatIndex - 1].progress = 0;
        let responseData = JSON.parse(response.data)
        if (responseData.thread_id) {
          this.threadId = responseData.thread_id;
        }
        const markedResponse = await marked(responseData.message);
        this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        if (responseData.faq_id) {
          this.messageList[this.currentBotChatIndex - 1].faq_id = responseData.faq_id
        }
        this.currentBotChatIndex = 0;
        this.stopTimer()
        setTimeout(() => {
          this.scrollToLastMessage();
        }, 1000);
      }
    });
  }

  abortGetMetadataSearch() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    // Unsubscribe from the subscription when the component is destroyed
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  createComponentModal(data: string): void {
    const modal = this.nzModelSer.create<ModelReferenceComponent, any>({
      nzTitle: 'Chat Reference',
      nzContent: ModelReferenceComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        dataAsString: data,
      },
      nzFooter: [],
      nzWidth: 800
    });
  }

  startNewChat() {
    this.filesListService.stopStream();
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
      this.chatResponse$ = null;
    }

    this.newChat.emit(null);
  }

  decodeHtml(html: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  }
  
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  openIssueModal(): void {
    this.filesListService.getIssue(localStorage.getItem(USERNAME)||'').subscribe(
      (response: any) => {
        this.issueData = response.data.map((item: any) => JSON.parse(item.data));
        this.modalRef = this.modal.create({
          nzTitle: 'Submit an Issue',
          nzContent: this.issueFormTemplate,
          nzWidth: '700px',
          nzStyle: { maxWidth: '100%' },
          nzFooter: [
            {
              label: 'Cancel',
              onClick: () => this.modalRef.destroy()
            },
            {
              label: 'Submit',
              type: 'primary',
              onClick: () => this.submitIssue()
            }
          ]
        });
    });
  }

  submitIssue(): void {
    if (this.issueForm.valid) {
      const issue = {
        ...this.issueForm.value,
        thread_id: this.threadId, 
        username: localStorage.getItem(USERNAME),
        collection_id: this.collection.collection_id,
        remarks: ''
      };
      console.log('Issue submitted:', issue);
      // Use the service to submit the issue
      this.filesListService.submitIssue(issue).subscribe(
        (response: any) => {
          this.notification.success('Success', 'Issue submitted successfully.');
          this.modalRef.destroy();
        },
        (error: any) => {
          this.notification.error('Error', 'Failed to submit issue.');
        }
      );
    } else {
      Object.values(this.issueForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  async copyMessage(message: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(message, 'text/html');
    const htmlContent = doc.body.innerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([doc.body.textContent || ''], { type: 'text/plain' })
        })
      ]);
      this.notification.success('Success', 'Text copied to clipboard.', { nzDuration: 2000 });
    } catch (error) {
      this.notification.error('Error', 'Failed to copy text.', { nzDuration: 2000 });
    }
  }

}