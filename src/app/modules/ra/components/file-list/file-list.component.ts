import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FileListService } from '../../services/file-list.service';
import { uploadedFiles } from '../../../../common/dummyData/dummyData';
import { Collection, CollectionFile } from '../../../../common/models/collection.model';
import { DocGuideFile } from '../../../../common/models/doc-guide.model';



@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    NzButtonModule,
    NzToolTipModule
  ],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.less'
})
export class FileListComponent {

  uploadedFileList: DocGuideFile[] = []
  selectedIndex: number = 0;
  private filesListService = inject(FileListService);

  ngOnInit() {
    this.getUploadedFiles()
    // this.getSectionsFiles()
  }
  onPdfSelection(file: DocGuideFile) {
    this.selectedIndex = file.file_id
    this.filesListService.currentPDF.set(file)
  }

  getUploadedFiles() {
    this.filesListService.getDocGuildeFileList().subscribe((res: any) => {
      this.uploadedFileList = res.data;
      this.selectedIndex = this.uploadedFileList[0].file_id
      this.filesListService.currentPDF.set(this.uploadedFileList[0])
    })
  }



}
