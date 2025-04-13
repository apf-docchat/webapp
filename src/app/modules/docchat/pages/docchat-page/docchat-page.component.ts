import { Component, HostListener, effect, inject } from '@angular/core';
import { FileListComponent } from '../../components/file-list/file-list.component';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { ChatScreenComponent } from '../../components/chat-screen/chat-screen.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CollectionService } from '../../../../common/services/collection.service';
import { Collection, CurrentScreen } from '../../../../common/models/collection.model';
import { CollectionFileListComponent } from '../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ListCollectionFilesComponent } from '../../components/list-collection-files/list-collection-files.component';

enum ShowSection {
  ALL = 'all',
  FILES = 'files',
  CHAT = 'chat',
}
@Component({
  selector: 'app-docchat-page',
  standalone: true,
  imports: [
    FileListComponent,
    ListCollectionFilesComponent,
    HeaderComponent,
    ChatScreenComponent,
    NzLayoutModule,
    NzButtonModule,
    NzDividerModule,
    NzEmptyModule,
    NzDrawerModule,
    NzIconModule,
  ],
  templateUrl: './docchat-page.component.html',
  styleUrl: './docchat-page.component.less'
})
export class DocchatPageComponent {
  drawerSer = inject(NzDrawerService)
  private collectionSer = inject(CollectionService)
  collectionList: any[] = []

  collectionSelected: Collection | null = null;
  previousValue = 0;
  innerWidth!: number;

  constructor() {
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
    if (screen === 'files') {
      this.activeSection = ShowSection.FILES
    } else if (screen === 'chat') {
      this.activeSection = ShowSection.CHAT
    }
  }


  openComponent(screen: CurrentScreen, collection: Collection | null): void {
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: screen, collection: collection ? collection : null }
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
  }
}
