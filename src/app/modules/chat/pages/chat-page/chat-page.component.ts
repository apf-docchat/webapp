import { Component, HostListener, effect, inject, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileListComponent } from '../../components/file-list/file-list.component';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { ChatScreenComponent } from '../../components/chat-screen/chat-screen.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CollectionService } from '../../../../common/services/collection.service';
import { Collection, CurrentScreen, module } from '../../../../common/models/collection.model';
import { CollectionFileListComponent } from '../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ListCollectionFilesComponent } from '../../components/list-collection-files/list-collection-files.component';
import { CollectionMgmtComponent } from '../../../dashboard/pages/dashboard/components/collection-mgmt/collection-mgmt.component';
import { DocChatComponent } from '../../../file-processor/components/doc-chat/doc-chat.component';
import { InsightsPageComponent } from '../insights-page/insights-page.component';
import { JobsPageComponent } from '../jobs-page/jobs-page.component';
import { DashboardService } from '../../../dashboard/service/dashboard.service';
import { UserAuthService } from '../../../../common/services/user-auth.service';

enum ShowSection {
  ALL = 'all',
  FILES = 'files',
  CHAT = 'chat',
}
@Component({
  selector: 'app-docchat-page',
  standalone: true,
  imports: [
    NgClass,
    FileListComponent,
    ListCollectionFilesComponent,
    HeaderComponent,
    ChatScreenComponent,
    CollectionMgmtComponent,
    DocChatComponent,
    InsightsPageComponent,
    JobsPageComponent,
    NzLayoutModule,
    NzButtonModule,
    NzDividerModule,
    NzEmptyModule,
    NzDrawerModule,
    NzIconModule,
    NzTabsModule
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.less'
})
export class ChatPageComponent {
  drawerSer = inject(NzDrawerService)
  private collectionSer = inject(CollectionService)
  collectionList: any[] = []

  collectionSelected: Collection | null = null;
  previousValue = 0;
  innerWidth!: number;

  modulesList: module[] = []
  dashboardSer = inject(DashboardService)
  userAuthSer = inject(UserAuthService)

  activeOrgRole = 'MEMBER';

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) 
  {
    effect(() => [
      this.collectionList = this.collectionSer.collectionList()
    ])
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.previousValue = this.innerWidth
    this.setScreenElements('initial')

    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      this.collectionSer.collectionList.set(res.data)
    })

    const storedCollection = localStorage.getItem('selectedCollection');
    if (storedCollection) {
      this.collectionSelected = JSON.parse(storedCollection);
    }

    this.getModuleList()
    this.activeOrgRole = this.userAuthSer.getOrgRole()
  }

  getModuleList() {
    this.dashboardSer.getModuleList().subscribe((res: any) => {
      this.modulesList = res.data
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (event.target instanceof Window) {
      this.innerWidth = event.target.innerWidth;
    }
    this.setScreenElements('resize')
  }

  setScreenElements(type: string) {
    if (this.innerWidth <= 800) {
      if (type === 'initial') {
        this.activeSection = ShowSection.CHAT
      }
      if (type === 'resize' && this.previousValue >= 800) {
        this.activeSection = ShowSection.CHAT
      }
    } else {
      this.activeSection = ShowSection.ALL
    }
    this.previousValue = this.innerWidth
  }


  activeSection: ShowSection = ShowSection.FILES

  setScreen(screen: string) {
    console.log('changing screen to:', screen);
    if (screen === 'files') {
      this.activeSection = ShowSection.FILES
    } else if (screen === 'chat') {
      this.activeSection = ShowSection.CHAT
    }
    this.cdr.detectChanges();
  }


  openComponent(screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean): void {
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: screen, collection: collection ? collection : null, modulesList: modulesList, isPrivate: isPrivate }
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe((data: any) => {
      if (typeof data === 'string') {
        // this.value = data;
      }
    });
  }

  selectCollection(collection: Collection | null) {
    this.collectionSelected = collection
    localStorage.setItem('selectedCollection', JSON.stringify(collection) || '');
    //localStorage.setItem('collectionId', collection?.collection_id.toString() || '');
    console.log('Collection changed to:', collection?.collection_name);
    //this.router.navigate(['/dashboard'])
    //window.location.reload();
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
