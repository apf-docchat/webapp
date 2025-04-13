import { Component, ElementRef, QueryList, ViewChild, ViewChildren, ViewContainerRef, effect, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FileListService } from '../../services/file-list.service';
import { Subscription, interval } from 'rxjs';
import { Collection, CollectionFile } from '../../../../common/models/collection.model';
import { SectionChatComponent } from '../section-chat/section-chat.component';
import { SectionChatService } from '../../services/section-chat.service';
import { marked } from 'marked';
import { ChatLoadingComponent } from '../../../../common/components/chat-loading/chat-loading.component';

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [
    SectionChatComponent,
    ChatLoadingComponent,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    FormsModule
  ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.less'
})
export class ChatScreenComponent {
  
  @Input() collection!: Collection | null;

  private filesListSer = inject(FileListService);
  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  currentBotChatIndex: number = 0;
  pdfSrc: CollectionFile | null = null;
  size: NzButtonSize = 'large';
  question: string = '';
  chatResponse$: Subscription | null = null;
  private filesListService = inject(SectionChatService);
  chatInstructionsList: string[] = [];

  thread_id: string = '';

  messageList: { index: number, message: string, isOwnerMe: boolean, metaData?: string }[] = []

  private countdownSubscription!: Subscription;
  remainingTime: number = 60;

  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChildren('chatMessage') chatMessages!: QueryList<any>;
  constructor() {
    effect(() => {
      this.pdfSrc = this.filesListSer.currentPDF();
    })
  }

  ngOnInit() {
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
    this.filesListSer.getResponse(query, this.pdfSrc!.file_id, this.thread_id);
    this.chatResponse$ = this.filesListSer.responseChunks.subscribe(async (response: any) => {
      if (response.event !== 'finalOutput') {
        this.messageList[this.currentBotChatIndex - 1].message += response.data
      } else {
        let responseData = JSON.parse(response.data)
        this.thread_id = responseData.thread_id
        const markedResponse = await marked(responseData.message);
        this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        this.messageList[this.currentBotChatIndex - 1].metaData = responseData.metadata
        this.currentBotChatIndex = 0;
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
        isOwnerMe: false
      })
      this.getResponse(this.question)
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

  createComponentModal(data: number): void {
    const modal = this.nzModelSer.create<SectionChatComponent, any>({
      nzTitle: 'Section Chat',
      nzContent: SectionChatComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        fileId: data,
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 800,
      nzBodyStyle: {
        padding: '10px',
      }
    });
  }
  changeFile() {
    this.filesListSer.currentPDF.set(null)
  }

  ngOnDestroy() {
    // Unsubscribe from the subscription when the component is destroyed
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }
  }
}