import { Component, ElementRef, QueryList, ViewChild, ViewChildren, inject, input, output } from '@angular/core';
import { SectionChatService } from '../../../../services/section-chat.service';
import { ChatLoadingComponent } from '../../../../../../common/components/chat-loading/chat-loading.component';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { Subscription, interval } from 'rxjs';
import { CallToAction, MessageModel, ServerHistoryModel } from '../../../../../../common/models/message.model';
import { marked } from 'marked';
import { DocGuideSection } from '../../../../../../common/models/doc-guide.model';

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [
    ChatLoadingComponent,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzDividerModule
  ],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.less'
})
export class ChatScreenComponent {

  sectionSelected = input.required<DocGuideSection>();
  onNameChange = output<number | null>();

  private sectionChatSer = inject(SectionChatService);

  // message variables
  question: string = '';
  currentBotChatIndex: number = 0;
  chatResponse$: Subscription | null = null;
  messageList: MessageModel[] = []

  stageId: string = 'INITIAL_CHAT';
  thread_id: string = '';

  // waiting for response
  private countdownSubscription!: Subscription;
  remainingTime: number = 60;

  // timeout variables
  private wordsPerMinute: number = 225;
  private inactiveTimerSubscription!: Subscription;
  inactiveTimer: number = 45;
  timeoutCallsLimit = 3;
  showTimeout: boolean = false;

  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChildren('chatMessage') chatMessages!: QueryList<any>;

  ngOnInit() {
    if (this.sectionSelected().latest_thread_id) {
      const thread_id = this.sectionSelected().latest_thread_id
      this.stageId = 'CONVERSATION';
      if (thread_id) {
        this.thread_id = thread_id;
        this.getSectionsChatHistory(thread_id)
      }
    } else {
      this.sendMessage();
    }
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

  getSectionsChatHistory(thread_id: string) {
    this.sectionChatSer.getSectionChatHistory(thread_id).subscribe((res: any) => {
      this.formatAndAddHistory(res.data.messages)
    })
  }

  async formatAndAddHistory(serverHistory: ServerHistoryModel[]) {
    const history: MessageModel[] = await Promise.all(
      serverHistory
        .filter((message: ServerHistoryModel) => message.content !== '')
        .map(async (serverMessage: ServerHistoryModel, index: number) => {
          const markedContent = await marked(serverMessage.content);
          return {
            isOwnerMe: serverMessage.role === 'user',
            message: markedContent,
            index: index + 1,
            role: serverMessage.role
          };
        })
    );
    this.messageList = history;
  }


  getResponse(query: any,) {
    if (this.chatResponse$) {
      this.chatResponse$.unsubscribe();
    }

    this.sectionChatSer.getResponse(query, this.sectionSelected().file_id, this.sectionSelected().section_id, this.thread_id, this.stageId);
    this.chatResponse$ = this.sectionChatSer.responseChunks.subscribe(async (response: any) => {
      if (response.event !== 'finalOutput') {
        if (response.event === 'initOutput') {
          let inItResponseData = JSON.parse(response.data);
          this.messageList[this.currentBotChatIndex - 1].message = inItResponseData.message;
          this.messageList[this.currentBotChatIndex - 1].role = inItResponseData.role;
          this.setInItOutput();
        } else {
          this.messageList[this.currentBotChatIndex - 1].message += response.data
        }

      } else {
        let responseData = JSON.parse(response.data)
        if (responseData?.action === 'GOTO_NEXT_SECTION') {
          this.nextSection(responseData);
        }
        this.thread_id = responseData.thread_id ? responseData.thread_id : ''
        if (responseData.thread_id) {
          this.thread_id = responseData.thread_id
        } else {
          if (!this.thread_id) {
            this.thread_id = ''
          }
        }
        if (responseData.message) {
          const markedResponse = await marked(responseData.message);
          this.messageList[this.currentBotChatIndex - 1].message = markedResponse;
        }
        this.messageList[this.currentBotChatIndex - 1].extra_query = responseData.extra_query
        this.messageList[this.currentBotChatIndex - 1].call_to_actions = responseData.call_to_actions
        this.currentBotChatIndex = 0;
        this.stopTimer()
        if (this.stageId !== 'TIMED_OUT') {
          this.stopInactiveTimer()
          this.startInactiveTimer(responseData.message);
        } else {
          this.stopInactiveTimer()
        }
        this.stageId = 'CONVERSATION';
      }
    });
  }

  sendMessage() {
    this.stopInactiveTimer()
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
    } else {
      this.addBotMessageToMessageList();
    }
  }

  setInItOutput() {
    this.currentBotChatIndex = this.messageList.length + 1;
    this.messageList.push({
      index: this.currentBotChatIndex,
      message: '',
      isOwnerMe: false
    })
  }

  addBotMessageToMessageList() {
    this.currentBotChatIndex = this.messageList.length + 1
    this.startTimer()
    this.messageList.push({
      index: this.currentBotChatIndex,
      message: '',
      isOwnerMe: false
    });
    this.getResponse('')
  }


  startTimer() {
    const countdown$ = interval(1000); // Emits a value every second
    this.countdownSubscription = countdown$.subscribe(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
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

  // Track Inactive Time
  calculateReadingTime(content: string): number {
    const words = this.countWords(content);
    const timeInMinutes = words / this.wordsPerMinute;
    return Math.ceil(timeInMinutes * 60); // Convert to seconds and round up
  }

  private countWords(content: string): number {
    return content.split(/\s+/).length;
  }

  startInactiveTimer(content: string) {
    if (content) {
      this.inactiveTimer = this.calculateReadingTime(content) + 25;
      this.inactiveTimer = this.inactiveTimer < 60 ? 60 : this.inactiveTimer;

      const countdown$ = interval(1000); // Emits a value every second
      this.inactiveTimerSubscription = countdown$.subscribe(() => {
        this.inactiveTimer--;
        if (this.inactiveTimer < 0) {
          this.inactiveTimerSubscription.unsubscribe();
          this.stageId = 'TIMED_OUT';
          this.sendMessage()
        }
      });
    }
  }

  stopInactiveTimer() {
    if (this.inactiveTimerSubscription) {
      this.inactiveTimerSubscription.unsubscribe();
      this.inactiveTimer = 60;
    }
  }

  trackInputField() {
    this.stopInactiveTimer()
    this.startInactiveTimer('')
  }

  callToActionEvent(buttonMetaData: CallToAction) {
    if (buttonMetaData.type === 'BUTTON' && buttonMetaData.metadata) {
      this.stageId = buttonMetaData.metadata.stage_id;
      this.sendMessage()
    }
  }

  changeSection() {
    this.onNameChange.emit(null);
  }

  nextSection(data: {
    action: string,
    metadata: {
      section_id: number
    }
  }) {
    this.onNameChange.emit(data.metadata.section_id);
  }


}
