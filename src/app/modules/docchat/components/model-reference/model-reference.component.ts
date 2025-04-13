import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { ModelDatas } from '../../../../common/dummyData/dummyData';

import { NzTabPosition, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-model-reference',
  standalone: true,
  imports: [NzTabsModule, NzDividerModule],
  templateUrl: './model-reference.component.html',
  styleUrl: './model-reference.component.less'
})
export class ModelReferenceComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData = inject(NZ_MODAL_DATA);

  tabs: Array<{ name: string; content: any; }> = [];
  nzTabPosition: NzTabPosition = 'top';
  selectedIndex = 0;

  // data = ModelDatas.data;

  ngOnInit() {
    let parsedData: any[] = JSON.parse(this.nzModalData.dataAsString)
    parsedData.forEach((article, index) => {
      this.tabs.push({
        name: `${index + 1}`,
        content: article
      });
    })
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }
}
