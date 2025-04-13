import { Component, Input, inject } from '@angular/core';
import { Collection, CurrentScreen } from '../../../../common/models/collection.model';
import { Router } from "@angular/router";
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CollectionFileListComponent } from '../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CollectionService } from '../../../../common/services/collection.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-collection-files',
  standalone: true,
  imports: [NzToolTipModule, NzButtonModule, NzDrawerModule, NzIconModule],
  templateUrl: './list-collection-files.component.html',
  styleUrl: './list-collection-files.component.less'
})
export class ListCollectionFilesComponent {
  drawerSer = inject(NzDrawerService)
  private collectionSer = inject(CollectionService);
  private modal = inject(NzModalService);

  @Input() collectionSelected!: Collection;
  router = inject(Router);

  columnList: string[] = [];
  columnListTooltip: string = '';

  openComponent(): void {
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: 'uploadFile', collection: null }
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      if (typeof data === 'string') {
        // this.value = data;
      }
    });
  }

  generateMetadata() {
    this.router.navigate(['/fileProcessor/docChat-settings']);
  }

  downloadFile(fileId: number): void {
    this.collectionSer.downloadFile('?file_ids='+fileId.toString()).subscribe((response: HttpResponse<Blob>) => {
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'file.pdf'; // Default filename

      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }
      if (response.body) {
        const url = window.URL.createObjectURL(response.body);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  downloadCollection(collectionSelected: Collection): void {
    this.collectionSer.downloadCollection('?collection_id='+collectionSelected.collection_id.toString()+'&collection_name='+collectionSelected.collection_name).subscribe((response: HttpResponse<Blob>) => {
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = collectionSelected.collection_name+'.zip';

      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }
      if (response.body) {
        const url = window.URL.createObjectURL(response.body);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  showColumns(collectionId: number, tableName: string) {
    this.collectionSer.getColumns(collectionId, tableName).subscribe((columns) => {
      this.columnList = columns.data;
      /* console.log('Received columns:', columns.data);
      this.columnListTooltip = this.columnList.join(', ');
      console.log('Tooltip text:', this.columnListTooltip); */
      this.showColumnModal(tableName);
    });
  }

  showColumnModal(tableName: string): void {
    this.modal.create({
      nzTitle: tableName + ' - Column List',
      nzContent: `<ul>${this.columnList.map(column => `<li>${column}</li>`).join('')}</ul>`,
      nzFooter: null
    });
  }

  ellipsisStringToHaveOnlyMax20Chars(str: string) {
    const maxCharLength = 20;
    return str.toString().length > maxCharLength ? str.toString().slice(0, maxCharLength) + '...' : str;
  }
}
