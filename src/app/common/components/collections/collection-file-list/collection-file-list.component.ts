import { Component, Inject, effect, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NZ_DRAWER_DATA, NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Collection, CollectionFile, CurrentScreen } from '../../../models/collection.model';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { CollectionService } from '../../../services/collection.service';
import { SetCollectionNameComponent } from '../set-collection-name/set-collection-name.component';
import { UploadFileComponent } from '../upload-file/upload-file.component';
import { SelectCollectionFilesComponent } from '../select-collection-files/select-collection-files.component';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import {module} from '../../../models/collection.model';
import { UserAuthService } from '../../../../common/services/user-auth.service';

@Component({
  selector: 'app-collection-file-list',
  standalone: true,
  imports: [
    FormsModule,
    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzCheckboxModule,
    NzPopconfirmModule,
    NzNotificationModule,
    SetCollectionNameComponent,
    UploadFileComponent,
    SelectCollectionFilesComponent
  ],
  templateUrl: './collection-file-list.component.html',
  styleUrl: './collection-file-list.component.less'
})
export class CollectionFileListComponent {

  currentScreen: CurrentScreen = 'uploadFile'

  selectedCollectionIndex: number = 0
  selectedCollection: string = ''; // = 'NotInAnyCollection'
  selectedCollectionObject: Collection | undefined;
  selectedCollectionModule: string = 'docchat';

  files: CollectionFile[] = [];
  collectionList: Collection[] = [];
  moveToCollectionList: Collection[] = [];

  modulesList: module[] = [];
  isPrivate: boolean = this.nzData.value.isPrivate;
  orgChosen: boolean = this.nzData.value.orgChosen;

  activeOrgRole = 'MEMBER';
  userAuthSer = inject(UserAuthService)

  ngOnInit() {
    this.currentScreen = this.nzData.value.screen
    this.modulesList = this.nzData.value.modulesList
    if (this.nzData.value.collection) {
      this.selectedCollection = this.nzData.value.collection.collection_name
    }
    this.onCollectionChange();

    this.activeOrgRole = this.userAuthSer.getOrgRole()
    this.collectionList = JSON.parse(localStorage.getItem('collections') || '[]')
  }

  constructor(
    private drawerRef: NzDrawerRef<string>,
    @Inject(NZ_DRAWER_DATA) public nzData: { value: { screen: CurrentScreen, collection: Collection, modulesList: module[], isPrivate: boolean, orgChosen: boolean } },
    private collectionSer: CollectionService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.collectionList = this.collectionSer.collectionList();
      this.onCollectionChange();
    })
    this.collectionList = this.collectionSer.collectionList();
    if (this.nzData.value.collection) {
      this.files = nzData.value.collection.files
    } else {
      if (this.collectionList.length != 0) {
        this.selectedCollection = this.collectionList[0].collection_name
        this.files = this.collectionList[0].files
      }
    }
  }

  isNewFile(file: CollectionFile): boolean {
    if (file.file_upload_datetime) {
      const fileUploadedDate = new Date(file.file_upload_datetime);
      const now = new Date();
      const timeDifference = now.getTime() - fileUploadedDate.getTime();
      const differenceInMinutes = Math.floor(timeDifference / (1000 * 60));

      return differenceInMinutes <= 350;
    } else {
      return false;
    }
  }

  close(): void {
    this.drawerRef.close(this.nzData);
  }

  onCollectionChange(newValue?: any) {
    console.log('newValue: ' + newValue);

    // Check if collectionList is empty
    if (this.collectionList.length === 0) {
      this.files = [];
      console.log('onCollectionChange files: No collections available.');
      this.cdr.detectChanges();
      return;
    }

    this.selectedCollectionIndex = this.collectionList.findIndex(collection => collection.collection_name === this.selectedCollection)
    //this.selectedCollection = this.collectionList[this.selectedCollectionIndex].collection_name

    // Handle case where selectedCollection is not found
    if (this.selectedCollectionIndex === -1) {
      this.files = [];
      console.log('onCollectionChange files: Selected collection not found.');
      this.cdr.detectChanges();
      return;
    }

    this.files = this.collectionList[this.selectedCollectionIndex].files
    console.log('onCollectionChange files: ' + this.files.map(file => file.file_name).join(', '));

    this.selectedCollectionModule = this.collectionList[this.selectedCollectionIndex].module_type;

    this.cdr.detectChanges();
  }

  onReturnCollectionChange(newValue?: any) {
    this.selectedCollectionIndex = this.collectionList.findIndex(collection => collection.collection_name === this.selectedCollection)
    //this.selectedCollection = this.collectionList[this.selectedCollectionIndex].collection_name
    this.files = this.collectionList[this.selectedCollectionIndex].files
    console.log('onReturnCollectionChange files: ' + this.files.map(file => file.file_name).join(', '));
    this.cdr.detectChanges();
  }

  closedCollectionNameScreen(event: { success: boolean, collectionName: string }) {
    if (event.success) {
      this.collectionSer.getUploadedFileList().subscribe((res: any) => {
        this.collectionSer.collectionList.set(res.data)
        if (this.collectionList.length >= 1) {
          // this.selectedCollection = this.collectionList[0].collection_name
          this.selectedCollection = event.collectionName;
          this.onReturnCollectionChange();
          this.cdr.detectChanges();
        }
      })
    }
    this.currentScreen = 'collectionView'
  }

  closedCollectionNameScreenCreate(event: { success: boolean, collectionName: string }) {
    if (event.success) {
      console.log('post create event', event)
      this.collectionSer.getUploadedFileList().subscribe((res: any) => {
        this.collectionSer.collectionList.set(res.data)
        this.collectionList = this.collectionSer.collectionList();
        if (this.collectionList.length >= 1) {
          //this.selectedCollection = this.collectionList[this.collectionList.length - 1].collection_name;
          this.selectedCollection = event.collectionName;
          console.log('selectedCollection', this.selectedCollection)
          this.onReturnCollectionChange();
          this.cdr.detectChanges();
        }
      })
    }
    this.currentScreen = 'collectionView'
  }

  closedCollectionNameScreenUpdate(event: { success: boolean, collectionName: string }) {
    if (event.success) {
      console.log('post update event', event)
      this.collectionSer.getUploadedFileList().subscribe((res: any) => {
        this.collectionSer.collectionList.set(res.data)
        this.collectionList = this.collectionSer.collectionList();
        if (this.collectionList.length >= 1) {
          this.selectedCollection = event.collectionName;
          console.log('selectedCollection', this.selectedCollection)
          this.onReturnCollectionChange();
          this.cdr.detectChanges();
        }
      })
    }
    this.currentScreen = 'collectionView'
  }

  changeScreen(page: CurrentScreen) {
    if (page === 'createCollection') {
      this.selectedCollectionObject = undefined;
      this.currentScreen = page;
    } else if (page === 'UpdateCollectionName') {
      this.selectedCollectionObject = this.collectionList[this.selectedCollectionIndex]
      this.currentScreen = page;
    } else if (page === 'uploadFile' || page === 'deleteFiles' || page === 'moveFiles') {
      this.selectedCollectionObject = this.collectionList[this.selectedCollectionIndex]
      this.currentScreen = page;
    }
    this.onCollectionChange();
    this.cdr.detectChanges();
  }

  deleteCollection() {
    let collectionId = this.collectionList[this.selectedCollectionIndex].collection_id
    this.collectionSer.deleteCollection(collectionId).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.refreshFileList();
      this.selectedCollection = this.collectionList[0].collection_name
      this.onReturnCollectionChange();
      this.cdr.detectChanges();
    })
  }

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this collection?',
      nzContent: '<b style="color: red;">Files in this collection will be deleted.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteCollection(),
      nzCancelText: 'No',
      // nzOnCancel: () => this.deleteCollection()
    });
  }

  refreshFileList() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      this.collectionSer.collectionList.set(res.data);
      if (this.collectionList.length >= 1) {
        this.selectedCollection = this.collectionList[0].collection_name;
        this.files = this.collectionList[0].files;
      }
    });
  }

}
