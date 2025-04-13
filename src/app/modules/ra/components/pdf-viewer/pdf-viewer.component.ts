import { Component, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

import { PDFDocumentProxy, PDFProgressData, PdfViewerModule, PdfViewerComponent } from 'ng2-pdf-viewer';
import { FileListService } from '../../services/file-list.service';
import { CollectionFile } from '../../../../common/models/collection.model';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [FormsModule, PdfViewerModule, NzInputModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.less'
})
export class PdfViewersComponent {
  fileListSer = inject(FileListService);

  @ViewChild(PdfViewerComponent) private pdfComponent!: PdfViewerComponent;

  // pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  pdfSrc: CollectionFile | null = null;
  stringToSearch = ''
  constructor() {
    effect(() => {
      this.pdfSrc = this.fileListSer.currentPDF();
    })

    effect(() => {
      let page = this.fileListSer.currentPageChanged();
      if (page === 'pdf') {
        setTimeout(() => {
          this.pdfComponent.updateSize();
        }, 1000);
      }
    })

    effect(() => {
      this.fileListSer.updatePDFSize();
      setTimeout(() => {
        this.pdfComponent.updateSize();
      }, 1000);
    })
  }

  onProgress(progressData: PDFProgressData) {
    // do anything with progress data. For example progress indicator
    // console.log('loading data');

  }

  callBackFn(pdf: PDFDocumentProxy) {
    // do anything with "pdf"
    // console.log('load complete');

  }
  search() {
    this.pdfComponent.eventBus.dispatch('find', {
      query: this.stringToSearch, type: 'again', caseSensitive: false, findPrevious: undefined, highlightAll: true, phraseSearch: true
    });
  }
}
