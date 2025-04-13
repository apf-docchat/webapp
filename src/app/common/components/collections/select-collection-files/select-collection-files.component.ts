import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Collection, CollectionFile, CollectionFileWithSelection } from '../../../models/collection.model';
import { CollectionService } from '../../../services/collection.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-select-collection-files',
  standalone: true,
  imports: [
    FormsModule,
    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzModalModule,
    NzNotificationModule
  ],
  templateUrl: './select-collection-files.component.html',
  styleUrl: './select-collection-files.component.less'
})
export class SelectCollectionFilesComponent {

  @Input() collectionName = '';
  @Input() actionType = '';
  @Output() returnValue = new EventEmitter<{ success: boolean, collectionName: string}>();

  selectedCollectionIndex: number = 0
  selectedCollection: string = 'NotInAnyCollection'

  toMoveSelectedCollection: string = ''
  toMoveCollectionId: number | null = null;

  files: CollectionFile[] = [];
  collectionList: Collection[] = [];
  moveToCollectionList: Collection[] = [];
  selectionType = 'delete'
  submited: boolean = false;

  fileSelectionList: any = []
  lastSelectedIndex: number | null = null;
  allFilesSelected: boolean = false;

  constructor(
    private collectionSer: CollectionService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.collectionList = this.collectionSer.collectionList();
    this.selectedCollectionIndex = this.collectionList.findIndex(collection => collection.collection_name === this.collectionName)
    this.selectedCollection = this.collectionList[this.selectedCollectionIndex].collection_name
    this.files = this.collectionList[this.selectedCollectionIndex].files
    this.selectionCollection(this.actionType)
  }

  onCollectionChange() {
    this.selectedCollectionIndex = this.collectionList.findIndex(collection => collection.collection_name === this.selectedCollection)
    this.selectedCollection = this.collectionList[this.selectedCollectionIndex].collection_name
    this.files = this.collectionList[this.selectedCollectionIndex].files
    this.selectionCollection(this.actionType)

    this.updateSelectAllState();
  }

  onMoveCollectionChange() {
    let toMoveSelectedIndex = this.collectionList.findIndex(collection => collection.collection_name === this.toMoveSelectedCollection)
    this.toMoveCollectionId = this.collectionList[toMoveSelectedIndex].collection_id
  }

  selectionCollection(type: string): void {
    let copyOfFiles: any = this.files
    this.fileSelectionList = copyOfFiles.map((collectionFile: any) => { return { ...collectionFile, 'isSelected': false } })
    if (this.actionType === 'moveFiles') {
      console.log('this.collectionList: ', this.collectionList);
      this.moveToCollectionList = this.collectionList.filter(collection => collection.collection_name !== this.selectedCollection)
    }
  }

  selectFile(event: MouseEvent, seletedIndex: number): void {
    event.stopPropagation();
    // this.fileSelectionList[seletedIndex].isSelected = !this.fileSelectionList[seletedIndex].isSelected
    if (this.fileSelectionList[seletedIndex].isSelected) {
      this.fileSelectionList[seletedIndex].isSelected = !this.fileSelectionList[seletedIndex].isSelected
    } else {
      this.fileSelectionList[seletedIndex].isSelected = !this.fileSelectionList[seletedIndex].isSelected
      if (this.lastSelectedIndex !== null && event.shiftKey) {
        const start = Math.min(seletedIndex, this.lastSelectedIndex);
        const end = Math.max(seletedIndex, this.lastSelectedIndex);
        for (let i = start; i <= end; i++) {
          this.fileSelectionList[i].isSelected = true;
        }
      }
      this.lastSelectedIndex = seletedIndex
    }

    // Update the allFilesSelected property based on whether all files are selected
    this.updateSelectAllState();

  }

  updateSelectAllState(): void {
    // Check if all files are selected
    this.allFilesSelected = this.fileSelectionList.length > 0 && 
                           this.fileSelectionList.every((file: { isSelected: any; }) => file.isSelected);
  }

  backToScreen(value: boolean) {
    if (value) {
      // let filesListIds = this.fileSelectionList
      //   .filter((file: CollectionFileWithSelection) => file.isSelected)
      //   .map(((file: CollectionFileWithSelection) => file.file_id.toString()))
      if (this.actionType === 'moveFiles') {
        this.submited = true;
        if (this.toMoveSelectedCollection !== '' && this.toMoveCollectionId != null) {
          // this.collectionSer.moveFiles({ 'collection_id': this.toMoveCollectionId, 'file_ids': filesListIds }).subscribe((res: any) => {
          //   this.notification.create(
          //     'success',
          //     'Success',
          //     res.message,
          //     { nzPlacement: 'bottomLeft' }
          //   );
          //   this.returnValue.emit(value);
          // })
          this.showDeleteConfirm()
        }
      }
      if (this.actionType === 'deleteFiles') {
        // this.collectionSer.deleteFiles({ 'file_ids': filesListIds }).subscribe((res: any) => {
        //   this.notification.create(
        //     'success',
        //     'Success',
        //     res.message,
        //     { nzPlacement: 'bottomLeft' }
        //   );
        //   this.returnValue.emit(value);
        // })
        this.showDeleteConfirm()
      }
      // this.showDeleteConfirm()
    } else {
      this.returnValue.emit({ success: true, collectionName: this.selectedCollection });
    }
  }

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: this.actionType === 'moveFiles' ? `Are you sure you want to move the files to (${this.toMoveSelectedCollection}) collection?` : 'Are you sure you want to delete the selected files?',
      // nzContent: '<b style="color: red;">Files in this collection will be moved to (NotInAnyCollection) collection</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: this.actionType === 'moveFiles' ? false : true,
      nzOnOk: () => {
        let filesListIds = this.fileSelectionList
          .filter((file: CollectionFileWithSelection) => file.isSelected)
          .map(((file: CollectionFileWithSelection) => file.file_id.toString()))
        if (this.actionType === 'moveFiles') {
          this.submited = true;
          if (this.toMoveSelectedCollection !== '' && this.toMoveCollectionId != null) {
            this.collectionSer.moveFiles({ 'collection_id': this.toMoveCollectionId, 'file_ids': filesListIds }).subscribe((res: any) => {
              this.notification.create(
                'success',
                'Success',
                res.message,
                { nzPlacement: 'bottomLeft' }
              );
              this.refreshFileList();
              this.returnValue.emit({ success: true, collectionName: this.selectedCollection });
            })
          }
        }
        if (this.actionType === 'deleteFiles') {
          this.collectionSer.deleteFiles({ 'file_ids': filesListIds }).subscribe((res: any) => {
            this.notification.create(
              'success',
              'Success',
              res.message,
              { nzPlacement: 'bottomLeft' }
            );
            this.refreshFileList();
            this.returnValue.emit({ success: true, collectionName: this.selectedCollection });
          })
        }
      },
      nzCancelText: 'No',
      // nzOnCancel: () => this.deleteCollection()
    });
  }

  refreshFileList() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      this.collectionList = res.data;
      this.onCollectionChange();
    });
  }

  toggleAllFiles(): void {
    // Update all files to match the "Select All" checkbox state
    this.fileSelectionList.forEach((file: { isSelected: boolean; }) => {
      file.isSelected = this.allFilesSelected;
    });
  }
  
}
