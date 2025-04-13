import { Component, inject, Input } from '@angular/core';
import { Collection } from '../../../../common/models/collection.model';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DocAnalysisService } from '../../services/file-list/docAnalysis.service';

@Component({
  selector: 'app-excel-preview',
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule],
  templateUrl: './excel-preview.component.html',
  styleUrl: './excel-preview.component.less'
})
export class ExcelPreviewComponent {

  @Input() fileSelected!: any;

  private docAnalysisSer = inject(DocAnalysisService);

  tableHeaders: string[] = [];
  listOfData: any[] = [];

  showPreview = false;

  ngOnInit(): void {
    console.log(this.fileSelected);
    //this.getFileData()
  }

  splitStringToHaveOnlyMax10Words(str: string) {
    const maxWordLength = 10;
    return str.toString().split(' ').length > maxWordLength ? str.toString().split(' ').slice(0, maxWordLength).join(' ') + '...' : str;
  }

  getFileData() {
    this.docAnalysisSer.getSelectedFileData(this.fileSelected.file_id).subscribe((res: any) => {
      console.log(res)
      this.tableHeaders = res.data.headers
      this.listOfData = res.data.rows;
    })

  }

  downloadFile(fileUrl: string) {
    this.docAnalysisSer.downloadFile(fileUrl, this.fileSelected.file_name);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      this.getFileData();
    }
  }

}
