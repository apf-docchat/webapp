import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzProgressModule } from 'ng-zorro-antd/progress';


import { DocInsightService } from '../../services/file-list/docInsight.service';
import { Subject, Subscription, interval } from 'rxjs';
import { ModelReferenceComponent } from '../model-reference/model-reference.component';
import { Collection } from '../../../../common/models/collection.model';
import { marked } from 'marked';

type MessageType = 'default' | 'metasearch';

type Message = { index: number, message: string, isOwnerMe: boolean, metaData?: string, searchType?: string, faq_id?: number, progress?: number }

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
    NzSwitchModule
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
  private filesListService = inject(DocInsightService);
  currentBotChatIndex: number = 0;

  size: NzButtonSize = 'large';
  question: string = '';
  chatResponse$: Subscription | null = null;
  threadId: string = '';

  messageList: Message[] = []

  private countdownSubscription!: Subscription;
  remainingTime: number = 60;

  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChildren('chatMessage') chatMessages!: QueryList<any>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}

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

  getResponse(query: any,) {
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }
    this.filesListService.getResponse(query, this.collection.collection_id, this.threadId);
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
        setTimeout(() => {
          this.scrollToLastMessage();
        }, 1000);
        this.stopTimer()
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
    this.filesListService.getImprovedSearch(this.collection.collection_id, faq_id);
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
        setTimeout(() => {
          this.scrollToLastMessage();
        }, 1000);
        this.stopTimer()
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
  
}