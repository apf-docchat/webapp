import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileProcessorService } from '../../services/file-processor.service';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DocChatSchema, DocChatSchemaWithIDwithIsSelected } from '../../../../common/models/doc_chat.model';

@Component({
  selector: 'app-meta-data-crud',
  standalone: true,
  imports: [
    FormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag
  ],
  templateUrl: './meta-data-crud.component.html',
  styleUrl: './meta-data-crud.component.less'
})
export class MetaDataCrudComponent {
  notification = inject(NzNotificationService)
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  private fileProcessorSer = inject(FileProcessorService)

  metaDataKey: string = ''
  metaDataDescription: string = ''

  metaDataList: DocChatSchema[] = [];
  metaDataListForDelete: DocChatSchemaWithIDwithIsSelected[] = [];

  constructor() {

  }
  ngOnInit(): void {
    if (this.nzModalData.modelType === 'edit') {
      this.metaDataKey = this.nzModalData.metaData.field;
      this.metaDataDescription = this.nzModalData.metaData.description;
    } else if (this.nzModalData.modelType === 'delete') {
      this.metaDataListForDelete = this.nzModalData.metaDataList.map((metaData: DocChatSchemaWithIDwithIsSelected) => {
        return { ...metaData, isSelected: false }
      })
    }
    else if (this.nzModalData.modelType === 'reArrange') {
      this.metaDataList = [...this.nzModalData.metaDataList.sort((a: any, b: any) => a.order_number - b.order_number)];
      console.log(this.metaDataList);

    }
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }

  addMetaData() {
    if (!this.metaDataKey || !this.metaDataDescription) {
      this.notification.create(
        'error',
        'Error',
        'Please fill all the fields',
        { nzPlacement: 'bottomLeft' }
      );
      return
    }
    this.metaDataList.push({
      field: this.metaDataKey,
      description: this.metaDataDescription,
      order_number: 0
    })

    this.metaDataKey = '';
    this.metaDataDescription = '';
  }
  deleteMetaData(i: number) {
    this.metaDataList.splice(i, 1)
  }
  saveMetaData() {
    let weightIndex = 0;
    if (this.metaDataList.length <= 0) {
      this.notification.create(
        'error',
        'Error',
        'Please add atleast one metadata',
        { nzPlacement: 'bottomLeft' }
      );
      return
    }
    if (this.nzModalData.metaDataList.length > 0) {
      weightIndex = this.nzModalData.metaDataList.length;
    }

    this.metaDataList.map((metaData: DocChatSchema) => {
      metaData.order_number = weightIndex;
      weightIndex++;
    })
    const data = {
      collection_id: this.nzModalData.collectionId as number,
      schema: this.metaDataList
    }
    this.fileProcessorSer.addMetaDataSchemaValue(data).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.destroyModal()
    })
  }

  //saveMetaData
  updateMetaData() {
    if (!this.metaDataKey || !this.metaDataDescription) {
      this.notification.create(
        'error',
        'Error',
        'Please fill all the fields',
        { nzPlacement: 'bottomLeft' }
      );
      return
    }

    const data = {
      schema_id: this.nzModalData.metaData.schema_id as number,
      field: this.metaDataKey,
      description: this.metaDataDescription,
      collection_id: this.nzModalData.collectionId as number,
      order_number: this.nzModalData.metaData.order_number
    }
    this.fileProcessorSer.updateMetaDataSchemaValue(data).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.destroyModal()
    })
  }

  deleteMetaDataKeys() {
    if (this.metaDataListForDelete.filter((metaData: DocChatSchemaWithIDwithIsSelected) => metaData.isSelected).length <= 0) {
      this.notification.create(
        'error',
        'Error',
        'Select atleast one metadata',
        { nzPlacement: 'bottomLeft' }
      );
      return
    }

    const data = {
      collection_id: this.nzModalData.collectionId as number,
      schema_ids: [...this.metaDataListForDelete.filter((metaData: DocChatSchemaWithIDwithIsSelected) => metaData.isSelected).map((metaData: DocChatSchemaWithIDwithIsSelected) => metaData.schema_id)],
    }

    this.fileProcessorSer.deleteMetaDataSchemaValue(data).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.destroyModal()
    })
  }

  drop(event: CdkDragDrop<DocChatSchema[]>) {
    if (event.previousIndex === event.currentIndex) return

    moveItemInArray(this.metaDataList, event.previousIndex, event.currentIndex);

    let movedItem = this.metaDataList[event.currentIndex];

    console.log(event);
    console.log(movedItem);

    const data = {
      schema_id: movedItem.schema_id!,
      weight_to: event.currentIndex,
      collection_id: this.nzModalData.collectionId
    }

    this.fileProcessorSer.rearrangeMetaDataSchemaValue(data).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
    })


  }
}
