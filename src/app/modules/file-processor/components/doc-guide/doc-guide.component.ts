import { Component, ViewContainerRef, effect, inject } from '@angular/core';
import { Collection } from '../../../../common/models/collection.model';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CollectionService } from '../../../../common/services/collection.service';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { Router } from '@angular/router';
import { FileProcessorService } from '../../services/file-processor.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AddDeleteFilesComponent } from '../add-delete-files/add-delete-files.component';

@Component({
  selector: 'app-doc-guide',
  standalone: true,
  imports: [
    HeaderComponent,
    NzDividerModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzCollapseModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './doc-guide.component.html',
  styleUrl: './doc-guide.component.less'
})
export class DocGuideComponent {
  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  private collectionSer = inject(CollectionService)
  private fileProcessorSer = inject(FileProcessorService)
  collectionList: any[] = []

  panels = [
    {
      active: true,
      disabled: false,
      name: 'Add files to docGuide',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    }
  ];

  constructor(private router: Router) {
    this.getDocGuideFiles()
  }

  getDocGuideFiles() {
    this.fileProcessorSer.getDocGuideFiles().subscribe((res: any) => {
      this.collectionList = res.data;
    })
  }

  ngOnInit() {}

  back() {
    this.router.navigate(['/fileProcessor'])
  }

  openAddandDeleteModal(type: string): void {
    const modal = this.nzModelSer.create<AddDeleteFilesComponent, any>({
      nzTitle: type === 'add' ? 'Add File' : 'Delete File',
      nzContent: AddDeleteFilesComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        dataAsString: type,
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
        this.getDocGuideFiles()
      }
    });
  }
}
