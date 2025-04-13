import { Component, Input, inject } from '@angular/core';
import { Collection, CurrentScreen } from '../../../../common/models/collection.model';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CollectionFileListComponent } from '../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDrawerService } from 'ng-zorro-antd/drawer';

@Component({
  selector: 'app-list-collection-files',
  standalone: true,
  imports: [NzToolTipModule, NzButtonModule, NzDrawerModule],
  templateUrl: './list-collection-files.component.html',
  styleUrl: './list-collection-files.component.less'
})
export class ListCollectionFilesComponent {
  drawerSer = inject(NzDrawerService)

  @Input() collectionSelected!: Collection;


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
}
