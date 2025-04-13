import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTabsModule } from 'ng-zorro-antd/tabs';



import { Subject, Subscription, interval } from 'rxjs';
import { ModelReferenceComponent } from '../model-reference/model-reference.component';
import { Collection } from '../../../../common/models/collection.model';
import { marked } from 'marked';
import { DocAnalysisService } from '../../services/file-list/docAnalysis.service';

type MessageType = 'default' | 'metasearch';

type Message = { index: number, message: string, isOwnerMe: boolean, metaData?: string, searchType?: string, faq_id?: number, progress?: number, table?: boolean, image_data?: string }

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    FormsModule,
    NzModalModule,
    NzProgressModule,
    NzSwitchModule,
    NzTabsModule
  ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.less'
})
export class ChatScreenComponent {
  private subscription!: Subscription;
  threadId: string = '';

  @Input() file!: any;
  @Input() collection!: Collection | null;  
  @Output() newChat = new EventEmitter<null>();


  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  private filesListService = inject(DocAnalysisService);
  chatInstructionsList: string[] = [];
  currentBotChatIndex: number = 0;

  size: NzButtonSize = 'large';
  question: string = '';
  chatResponse$: Subscription | null = null;

  messageList: Message[] = []

  collection_id = '';

  private countdownSubscription!: Subscription;
  remainingTime: number = 60;

  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChildren('chatMessage') chatMessages!: QueryList<any>;

  ngOnInit() {
    let selectedCollection = localStorage.getItem('selectedCollection') || '';
    if (selectedCollection != '') {
      this.collection_id = JSON.parse(selectedCollection).collection_id;
    }
    this.getChatInstructionsValue();
  }

  ngAfterViewInit() {
    this.chatMessages.changes.subscribe(() => {
      if (this.currentBotChatIndex != 0) {
        this.scrollToLastMessage();
      }
    });
  }

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
    let file_ids = [];
    file_ids.push(this.file.file_id);
    this.filesListService.getResponse(query, file_ids, this.threadId, this.collection_id);
    this.chatResponse$ = this.filesListService.responseChunks.subscribe(async (response: any) => {
      if (response.event !== 'finalOutput') {

        if (response.event === 'progressOutput') {
          let responseData = JSON.parse(response.data);
          this.messageList[this.currentBotChatIndex - 1].progress = responseData.progress_percentage;
        } else if (response.event === 'progressEvent') {
          let responseData = JSON.parse(response.data);
          const markedResponse = await marked(responseData.message);
          this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        } else {
          this.messageList[this.currentBotChatIndex - 1].message += response.data
        }

      } else {
        this.messageList[this.currentBotChatIndex - 1].progress = 0;
        let responseData = JSON.parse(response.data)
        if (responseData.thread_id) {
          this.threadId = responseData.thread_id;
        }
        if (responseData.table) {
          this.messageList[this.currentBotChatIndex - 1].table = responseData.table;
        }
        // const markedResponse = await marked(responseData.message);
        // this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        this.messageList[this.currentBotChatIndex - 1].message = responseData.message;
        if (responseData.faq_id) {
          this.messageList[this.currentBotChatIndex - 1].faq_id = responseData.faq_id
        }
        if (responseData.image_data) {
          this.messageList[this.currentBotChatIndex - 1].image_data = responseData.image_data;
        }
        this.currentBotChatIndex = 0;
        setTimeout(() => {
          this.scrollToLastMessage();
        }, 1000);
        this.stopTimer()
      }
    });
  }

  docAnalysisRestApi() {
    let file_ids = [];
    file_ids.push(this.file.file_id);
    this.filesListService.docAnalysisRestApi(this.question, file_ids, this.threadId).subscribe(async (response: any) => {
      this.messageList[this.currentBotChatIndex - 1].progress = 0;
      const markedResponse = await marked(response.message);
      this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
      if (response.thread_id) {
        this.threadId = response.thread_id;
      }
      this.currentBotChatIndex = 0;
      setTimeout(() => {
        this.scrollToLastMessage();
      }, 1000);
      this.stopTimer()
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
      //this.docAnalysisRestApi();
      this.question = '';
    }
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
    this.newChat.emit(null);
  }
  /* downloadFile(fileUrl: string) {
    this.filesListService.downloadFile(fileUrl, this.file.file_name);
  } */
}