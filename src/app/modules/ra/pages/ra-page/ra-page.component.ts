import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FileListService } from "../../services/file-list.service";
import { FileListComponent } from "../../components/file-list/file-list.component";
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { PdfViewersComponent } from '../../components/pdf-viewer/pdf-viewer.component';
import { ChatScreenComponent } from '../../components/chat-screen/chat-screen.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { UserNavComponent } from '../../../../common/components/user-nav/user-nav.component';
import { DocGuideFile } from '../../../../common/models/doc-guide.model';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Collection } from '../../../../common/models/collection.model';

enum ShowSection {
  ALL = 'all',
  FILES = 'files',
  PDF = 'pdf',
  CHAT = 'chat',
}

@Component({
  selector: 'app-ra-page',
  standalone: true,
  imports: [
    FileListComponent,
    HeaderComponent,
    PdfViewersComponent,
    ChatScreenComponent,
    NzLayoutModule,
    NzIconModule,
    NzDividerModule,
    NzEmptyModule,
    NzDropDownModule
  ],
  templateUrl: './ra-page.component.html',
  styleUrl: './ra-page.component.less'
})
export class RaPageComponent implements OnInit {
  previousValue = 0;
  filesListService = inject(FileListService);
  uploadedFileList: DocGuideFile[] = []
  innerWidth!: number;

  collectionSelected: Collection | null = null;

  layoutRation: number = 5;
  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.previousValue = this.innerWidth
    this.setScreenElements('initial');
    this.getUploadedFiles()

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
        this.activeSection = ShowSection.FILES
      }
      if (type === 'resize' && this.previousValue >= 800) {
        this.activeSection = ShowSection.CHAT
      }
    } else {
      this.activeSection = ShowSection.ALL
    }
    this.previousValue = this.innerWidth
  }


  activeSection: ShowSection = ShowSection.ALL

  setScreen(screen: string) {
    if (screen === 'files') {
      this.activeSection = ShowSection.FILES
    } else if (screen === 'pdf') {
      this.activeSection = ShowSection.PDF
    } else if (screen === 'chat') {
      this.activeSection = ShowSection.CHAT
    }
    this.filesListService.currentPageChanged.set(this.activeSection)
  }

  setLayoutClass(value: number) {
    this.layoutRation = value;
    this.filesListService.updatePDFSize.set(new Date().toString());
  }

  selectFile(file: any | null) {
    this.filesListService.currentPDF.set(file)
  }

  getUploadedFiles() {
    this.filesListService.getDocGuildeFileList().subscribe((res: any) => {
      this.uploadedFileList = res.data;
      const storedCollection = localStorage.getItem('selectedCollection');
      if (storedCollection) {
        let collectionSelected = JSON.parse(storedCollection);
        //filter uploadedFileList to only retain files that belong to the selected collection
        if (collectionSelected) {
          this.uploadedFileList = this.uploadedFileList.filter(file => file.collection_id === collectionSelected!.collection_id);
        }
      }

    })
  }

  ngOnDestroy() {
    this.filesListService.currentPDF.set(null)
  }
}
