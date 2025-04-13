import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CollectionService } from '../../../../common/services/collection.service';
import { Collection } from '../../../../common/models/collection.model';


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

  uploadedFileList: Collection[] = []
  selectedIndex: number = 0;

  private collectionSer = inject(CollectionService);

  constructor() {
    this.uploadedFileList = this.collectionSer.collectionList()
  };


  ngOnInit() {}

}
