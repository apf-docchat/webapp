import { Component, HostListener, ViewContainerRef, effect, inject } from '@angular/core';
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
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { EnvConfigService } from '../../../../common/services/env-config.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserAuthService } from '../../../../common/services/user-auth.service';
import { ExcelPreviewComponent } from '../../components/excel-preview/excel-preview.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DeleteFilesComponent } from '../../components/delete-files/delete-files.component';
import { ShowErrorMessageComponent } from '../../components/show-error-message/show-error-message.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

enum ShowSection {
  ALL = 'all',
  FILES = 'files',
  CHAT = 'chat',
}
@Component({
  selector: 'app-docAnalysis-page',
  standalone: true,
  imports: [
    DeleteFilesComponent,
    FileListComponent,
    ListCollectionFilesComponent,
    ExcelPreviewComponent,
    HeaderComponent,
    ChatScreenComponent,
    NzLayoutModule,
    NzButtonModule,
    NzDividerModule,
    NzEmptyModule,
    NzDrawerModule,
    NzIconModule,
    NzUploadModule,
    NzDropDownModule
  ],
  templateUrl: './docAnalysis-page.component.html',
  styleUrl: './docAnalysis-page.component.less'
})
export class DocAnalysisPageComponent {
  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  drawerSer = inject(NzDrawerService)
  private notification = inject(NzNotificationService)
  private collectionSer = inject(CollectionService)
  fileList: any[] = []
  fileSelected: any | null = null;
  collectionSelected: Collection | null = null;

  previousValue = 0;
  innerWidth!: number;

  token = ''
  orgId = ''
  apiBaseUrl = '';
  uploadUrl = `${this.apiBaseUrl}doc-analysis/upload`;

  layoutRation: number = 5;

  selectedCollectionName = '';

  constructor(private userAuthSer: UserAuthService, private envConfig: EnvConfigService) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
    this.uploadUrl = `${this.apiBaseUrl}/doc-analysis/upload`
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.previousValue = this.innerWidth
    this.setScreenElements('initial')

    this.orgId = this.userAuthSer.getOrgId()!
    this.token = `Bearer ${this.userAuthSer.getUserToken()!}`

    const storedCollection = localStorage.getItem('selectedCollection');
    if (storedCollection) {
      this.collectionSelected = JSON.parse(storedCollection);
    }

    if (this.collectionSelected != null) {
      this.selectedCollectionName = this.collectionSelected['collection_name']
    }
    console.log(this.selectedCollectionName)
    this.collectionSer.getUploadedFileList('?collection_name='+this.selectedCollectionName).subscribe((res: any) => {
      this.fileList = res.data[0].files
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

  selectFile(file: any | null) {
    this.fileSelected = file
  }


  deleteFilesModal(): void {
    const modal = this.nzModelSer.create<DeleteFilesComponent, any>({
      nzTitle: 'Delete Files',
      nzContent: DeleteFilesComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        fileList: this.fileList
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 500,
      nzBodyStyle: {
        // padding: '10px',
        'max-height': '85vh'
      }
    });

    modal.afterClose.subscribe(result => {
      if (result?.data) {
        this.collectionSer.getUploadedFileList('?collection_name='+this.selectedCollectionName).subscribe((res: any) => {
          this.fileList = res.data[0].files
        })
      }
    });
  }

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      console.log(info.file.response);
      if (!info.file.response.success) {
        const modal = this.nzModelSer.create<ShowErrorMessageComponent, any>({
          nzTitle: 'Upload Failed : ' + info.file.name,
          nzContent: ShowErrorMessageComponent,
          nzViewContainerRef: this.viewContainerRef,
          nzData: {
            errorMessageObject: info.file.response.column_errors,
            file: info.file
          },
          nzFooter: null,
          nzCentered: true,
          nzWidth: 800,
          nzBodyStyle: {
            // padding: '10px',
            'max-height': '85vh'
          },
          nzMaskClosable: false
        });
      } else {
        this.notification.create(
          'success',
          'Success',
          `${info.file.name} file uploaded successfully`,
          { nzPlacement: 'bottomLeft' }
        );
        this.collectionSer.getUploadedFileList('?collection_name='+this.selectedCollectionName).subscribe((res: any) => {
          this.fileList = res.data[0].files
        })
      }
    } else if (info.file.status === 'error') {
      this.notification.create(
        'error',
        'Error',
        `${info.file.name} file upload failed.`,
        { nzPlacement: 'bottomLeft' }
      );
    }
  }
  // On file Select
  onChange(event: any) {
    const input = event.target as HTMLInputElement;
    const file: File = event.target.files[0];

    if (file) {
      console.log(file.name);

      // const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileExtension = file.name.split('.').pop() ?? '';
      if (['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        // Process the file
        console.log('Valid file selected:', file.name);

        const modal = this.nzModelSer.create<ShowErrorMessageComponent, any>({
          nzTitle: 'Uploading : ' + file.name,
          nzContent: ShowErrorMessageComponent,
          nzViewContainerRef: this.viewContainerRef,
          nzData: {
            // errorMessageObject: file.response.column_errors,
            file: file
          },
          nzFooter: null,
          nzCentered: true,
          nzWidth: 600,
          nzBodyStyle: {
            // padding: '10px',
            'max-height': '85vh'
          }
        });

        modal.afterClose.subscribe(result => {
          if (result) {
            this.collectionSer.getUploadedFileList('?collection_name='+this.selectedCollectionName).subscribe((res: any) => {
              this.fileList = res.data[0].files
            })
          }
        });

        input.value = '';
      } else {
        // Handle invalid file type
        console.error('Invalid file type. Please select a CSV or Excel file.');
        input.value = '';
      }
    }
  }
  setLayoutClass(value: number) {
    this.layoutRation = value;
    // this.filesListService.updatePDFSize.set(new Date().toString());
  }
}
