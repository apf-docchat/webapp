import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileProcessorService } from '../../../file-processor/services/file-processor.service';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { DocAnalysisFileService } from '../../services/file-list/docAnalysis-file.service';

@Component({
  selector: 'app-delete-files',
  standalone: true,
  imports: [
    FormsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzButtonModule,
    NzEmptyModule
  ],
  templateUrl: './delete-files.component.html',
  styleUrl: './delete-files.component.less'
})
export class DeleteFilesComponent {
  notification = inject(NzNotificationService)
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  private docAnalysisFileSer = inject(DocAnalysisFileService);
  showSection = ''
  files: any[] = [];
  selectedFileslist: number[] = []
  fileSelectionList: any = []
  lastSelectedIndex: number | null = null;
  docGuideFileSelectionList: any = []
  docGuideLastSelectedIndex: number | null = null;

  ngOnInit(): void {
    this.docGuideFileSelectionList = this.nzModalData.fileList.map((file: any) => {
      return { ...file, isSelected: false }
    });
  }

  submitButton() {
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

  onConfirm(confirm: boolean) {
    if (confirm) {
      this.docAnalysisFileSer.deleteAnalysisFiles({
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
    } else {
      this.showSection = ''
    }
  }
}
