import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FileProcessorService } from '../../services/file-processor.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-add-delete-files',
  standalone: true,
  imports: [
    FormsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzButtonModule,
    NzEmptyModule
  ],
  templateUrl: './add-delete-files.component.html',
  styleUrl: './add-delete-files.component.less'
})
export class AddDeleteFilesComponent {
  notification = inject(NzNotificationService)
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  private fileProcessorSer = inject(FileProcessorService)

  selectedCollectionIndex: number = 0
  selectedCollection: string = 'NotInAnyCollection'

  files: any[] = [];
  collectionList: any[] = [];
  moveToCollectionList: any[] = [];
  fileSelectionList: any = []
  lastSelectedIndex: number | null = null;

  selectedFileslist: number[] = []

  showSection = 'add'

  docGuideList: any[] = []
  docGuideFileSelectionList: any = []
  docGuideLastSelectedIndex: number | null = null;

  constructor() {
    if (this.nzModalData.dataAsString === 'add') {
      this.showSection = 'add'
      this.getCollectionFiles();
    } else if (this.nzModalData.dataAsString === 'delete') {
      this.showSection = 'delete'
      this.getDocGuideList()
    }
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }

  getCollectionFiles() {
    this.fileProcessorSer.getDocGuideCollectionFiles().subscribe((res: any) => {
      this.collectionList = res.data
      this.onCollectionChange()
    })
  }

  onCollectionChange() {
    this.selectedCollectionIndex = this.collectionList.findIndex(collection => collection.collection_name === this.selectedCollection)
    this.selectedCollection = this.collectionList[this.selectedCollectionIndex].collection_name

    this.files = this.collectionList[this.selectedCollectionIndex].files
    this.selectionCollection('add')
  }

  selectionCollection(type: string): void {
    let copyOfFiles: any = this.files
    this.fileSelectionList = copyOfFiles.map((collectionFile: any) => { return { ...collectionFile, 'isSelected': false } })
    this.moveToCollectionList = this.collectionList.filter(collection => collection.collection_name !== this.selectedCollection)
  }

  selectFile(event: MouseEvent, seletedIndex: number): void {
    if (this.fileSelectionList[seletedIndex].is_processed) {
      return;
    }
    if (this.fileSelectionList[seletedIndex].isSelected) {
      this.fileSelectionList[seletedIndex].isSelected = !this.fileSelectionList[seletedIndex].isSelected
    } else {
      this.fileSelectionList[seletedIndex].isSelected = !this.fileSelectionList[seletedIndex].isSelected
      if (this.lastSelectedIndex !== null && event.shiftKey) {
        const start = Math.min(seletedIndex, this.lastSelectedIndex);
        const end = Math.max(seletedIndex, this.lastSelectedIndex);
        for (let i = start; i <= end; i++) {
          if (!this.fileSelectionList[i].is_processed) {
            this.fileSelectionList[i].isSelected = true;
          }
        }
      }
      this.lastSelectedIndex = seletedIndex
    }
  }


  getDocGuideList() {
    this.fileProcessorSer.getDocGuideFiles().subscribe((res: any) => {
      this.docGuideList = res.data;
      this.docGuideFileSelectionList = this.docGuideList.map((docGuideFile: any) => { return { ...docGuideFile, 'isSelected': false } })
    })
  }

  selectDocGuideFile(event: MouseEvent, seletedIndex: number): void {
    if (this.docGuideFileSelectionList[seletedIndex].isSelected) {
      this.docGuideFileSelectionList[seletedIndex].isSelected = !this.docGuideFileSelectionList[seletedIndex].isSelected
    } else {
      this.docGuideFileSelectionList[seletedIndex].isSelected = !this.docGuideFileSelectionList[seletedIndex].isSelected
      if (this.docGuideLastSelectedIndex !== null && event.shiftKey) {
        const start = Math.min(seletedIndex, this.docGuideLastSelectedIndex);
        const end = Math.max(seletedIndex, this.docGuideLastSelectedIndex);
        for (let i = start; i <= end; i++) {
          if (!this.docGuideFileSelectionList[i].is_processed) {
            this.docGuideFileSelectionList[i].isSelected = true;
          }
        }
      }
      this.docGuideLastSelectedIndex = seletedIndex
    }
  }



  submitButton() {
    if (this.nzModalData.dataAsString === 'add') {
      this.selectedFileslist = this.fileSelectionList.filter((file: any) => file.isSelected)
        .map(((file: any) => file.file_id))
      if (this.selectedFileslist.length < 1) {
        this.notification.create(
          'warning',
          'Warning',
          'Select atlest one file',
          { nzPlacement: 'bottomLeft' }
        );
      } else {
        this.showSection = 'confirm';
      }

    } else if (this.nzModalData.dataAsString === 'delete') {
      this.selectedFileslist = this.docGuideFileSelectionList.filter((file: any) => file.isSelected)
        .map(((file: any) => file.file_id))
      if (this.selectedFileslist.length < 1) {
        this.notification.create(
          'warning',
          'Warning',
          'Select atlest one file',
          { nzPlacement: 'bottomLeft' }
        );
      } else {
        this.showSection = 'confirm';
      }
    }
  }
  onConfirm(confirm: boolean) {
    if (confirm) {
      if (this.nzModalData.dataAsString === 'add') {
        this.fileProcessorSer.addFilesToDocGuide({
          "file_ids": this.selectedFileslist
        }).subscribe((res: any) => {
          this.notification.create(
            'success',
            'Success',
            res.message,
            { nzPlacement: 'bottomLeft' }
          );
          this.#modal.destroy({ data: confirm });
        })
      } else if (this.nzModalData.dataAsString === 'delete') {
        this.fileProcessorSer.deleteFilesToDocGuide({
          "file_ids": this.selectedFileslist
        }).subscribe((res: any) => {
          this.notification.create(
            'success',
            'Success',
            res.message,
            { nzPlacement: 'bottomLeft' }
          );
          this.#modal.destroy({ data: confirm });
        })
      }
    } else {
      this.showSection = this.nzModalData.dataAsString === 'add' ? 'add' : 'delete'
    }
  }
}
