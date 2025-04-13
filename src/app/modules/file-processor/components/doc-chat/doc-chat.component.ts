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
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { Router } from '@angular/router';
import { FileProcessorService } from '../../services/file-processor.service';
import { FormsModule } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FaqComponent } from '../faq/faq.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MetaDataCrudComponent } from '../meta-data-crud/meta-data-crud.component';
import { DocChatMetadataFile, DocChatMetadataFileWithIsSelected, DocChatSchemaWithID } from '../../../../common/models/doc_chat.model';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { UserAuthService } from '../../../../common/services/user-auth.service';
import { EnvConfigService } from '../../../../common/services/env-config.service';


@Component({
  selector: 'app-doc-chat',
  standalone: true,
  imports: [
    FormsModule,
    HeaderComponent,
    MetaDataCrudComponent,
    FaqComponent,
    NzDividerModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzCollapseModule,
    NzInputModule,
    NzProgressModule,
    NzCheckboxModule,
    NzModalModule,
    NzUploadModule,
    NzTabsModule,
  ],
  templateUrl: './doc-chat.component.html',
  styleUrl: './doc-chat.component.less'
})
export class DocChatComponent {
  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  private notification = inject(NzNotificationService)
  private collectionSer = inject(CollectionService)
  private fileProcessorSer = inject(FileProcessorService)
  collectionSelected: Collection | null = null;
  collectionList: any[] = []

  customInstruction: string = '';
  customInstructionCopy: string = '';
  customInstructionEditable: boolean = false;

  chatInstructionsValue: string = '';
  chatInstructionsList: string[] = [];

  metadataPercentageValue: number = 0;
  metadataFileUploaded: number = 0;
  metadataFileUploadedOutOf: number = 0;
  metadataList: DocChatSchemaWithID[] = [];
  metadataFileList: DocChatMetadataFileWithIsSelected[] = [];
  lastSelectedIndex: number | null = null;

  token = ''
  orgId = ''
  apiBaseUrl = '';
  uploadUrl = `${this.apiBaseUrl}collection/file`

  showConfirmRepopulationAll = false;
  confirmCollectionName: string = '';

  summaryPercentageValue: number = 0;
  summaryFileUploaded: number = 0;
  summaryFileUploadedOutOf: number = 0;
  shortSummary: string = '';
  longSummary: string = '';

  panels = [
    {
      active: false,
      disabled: false,
      name: 'Define/Edit Metadata Fields',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    },
    {
      active: false,
      disabled: false,
      name: 'Populate Metadata Values',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    },
    {
      active: true,
      name: 'Custom Instructions',
      disabled: false,
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    },
    {
      active: false,
      disabled: false,
      name: 'Chat Instructions',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    },
    {
      active: false,
      disabled: false,
      name: 'Summarise Files',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    },
    {
      active: false,
      disabled: false,
      name: 'FAQs',
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    }
  ];

  constructor(private router: Router, private userAuthSer: UserAuthService, private envConfig: EnvConfigService) {
    effect(() => [
      this.collectionList = this.collectionSer.collectionList()
    ]);
    this.apiBaseUrl = this.envConfig.apiBaseUrl
    this.uploadUrl = `${this.apiBaseUrl}/file-processor/metadata/upload`
  }

  ngOnInit() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      this.collectionSer.collectionList.set(res.data)
    })

    this.orgId = this.userAuthSer.getOrgId()!
    this.token = `Bearer ${this.userAuthSer.getUserToken()!}`
    this.collectionSelected = JSON.parse(localStorage.getItem('selectedCollection') || 'null');
    this.getCustomInstructions();
    this.getSummarySatus();
    this.getSummaryContent();
    this.getMetaDataSchemaValue();
    this.getMetadataFilesList();
    this.getChatInstructionsValue();
  }



  selectCollection(collection: Collection | null) {
    this.collectionSelected = collection;
    this.getCustomInstructions();
    this.getSummarySatus();
    this.getSummaryContent();
    this.getMetaDataSchemaValue();
    this.getMetadataFilesList();
    this.getChatInstructionsValue();
  }

  back() {
    this.router.navigate(['/fileProcessor'])
  }

  generateMetadata() {
    this.fileProcessorSer.generateMetadata(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.getMetaDataSchemaValue();
    })
  }

  getCustomInstructions() {
    this.fileProcessorSer.getCustomInstruction(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.customInstruction = res.data ? res.data : '';
      this.customInstructionCopy = res.data ? res.data : '';
    })
  }

  saveCustomInstructions() {
    this.fileProcessorSer.saveCustomInstruction({
      collection_id: this.collectionSelected!.collection_id,
      custom_instruction: this.customInstruction
    }).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.customInstructionEditable = false;
    }
    )
  }

  customInstructionAction() {
    if (this.customInstructionEditable) {
      if (this.customInstruction !== this.customInstructionCopy) {
        this.saveCustomInstructions();
      }
    } else {
      this.customInstructionEditable = true;
    }
  }

  customInstructionCancel() {
    this.customInstruction = this.customInstructionCopy
    this.customInstructionEditable = false;
  }

  getMetaDataStatus() {
    this.fileProcessorSer.getMetaDataStatus(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.metadataPercentageValue = res.data.percentage_value;
      this.metadataFileUploaded = res.data.total_processed_files_count;
      this.metadataFileUploadedOutOf = res.data.total_files_count;
    })
  }

  downloadMetadataString(): void {
    this.fileProcessorSer.downloadMetaData(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.downloadCSV(res.data)
    }
    )
  }

  getChatInstructionsValue(): void {
    this.fileProcessorSer.getChatInstructionValue(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.chatInstructionsList = res.data;
    }
    )
  }

  addInstructions(): void {
    this.chatInstructionsList.push(this.chatInstructionsValue);
    this.chatInstructionsValue = '';
  }
  deleteInstructions(index: number): void {
    this.chatInstructionsList.splice(index, 1);
    this.updateChatInstructions();
  }

  updateChatInstructions(): void {
    const instructionData = {
      "collection_id": this.collectionSelected!.collection_id,
      "collection_rules": this.chatInstructionsList
    }
    this.fileProcessorSer.updateChatInstructionValue(instructionData).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.getChatInstructionsValue();
    })
  }
  //new metadata changes

  getMetaDataSchemaValue(): void {
    this.fileProcessorSer.getMetaDataSchemaValue(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.metadataList = res.data;
    }
    )
  }

  openMetaDataCrudModal(type: string, metaData?: DocChatSchemaWithID | null, metadataList: DocChatSchemaWithID[] = []): void {
    let title = '';
    if (type === 'add') { title = 'Add MetaData'; }
    else if (type === 'delete') { title = 'Delete MetaData'; }
    else if (type === 'delete') { title = 'Delete MetaData'; }
    else if (type === 'reArrange') { title = 'Re-Order MetaData'; }

    const modal = this.nzModelSer.create<MetaDataCrudComponent, any>({
      nzTitle: title,
      nzContent: MetaDataCrudComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        modelType: type,
        collectionId: this.collectionSelected!.collection_id,
        metaData: type === 'edit' ? { ...metaData } : null,
        metaDataList: metadataList
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
        this.getMetaDataSchemaValue();
        this.getMetadataFilesList();
      }
      if (type == 'reArrange') {
        this.getMetaDataSchemaValue();
      }
    });
  }

  getFileCountWithLessThan30percent(): number {
    return this.metadataFileList.filter((metadataFile: DocChatMetadataFileWithIsSelected) => metadataFile.processed_percentage < 30).length
  }

  getMetadataFilesList() {
    this.fileProcessorSer.getMetaDataFilesList(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.metadataFileList = res.data.map((metadata: DocChatMetadataFile) => { return { ...metadata, 'isSelected': false } });
    })
  }

  allowedToRepopulate(metadataFile: DocChatMetadataFile): boolean {
    return !(metadataFile.processed_percentage < 100)
  }

  repopulateMetadata(redoAll: boolean = false): void {
    if (!redoAll) {
      if (!this.metadataFileList.some((metadataFile: DocChatMetadataFileWithIsSelected) => metadataFile.isSelected)) {
        this.notification.create(
          'error',
          'Error',
          'Please select atleast one file',
          { nzPlacement: 'bottomLeft' }
        );
        return
      }
    }
    const data: { collection_id: number, file_ids?: number[] } = {
      collection_id: this.collectionSelected!.collection_id,
      file_ids: this.metadataFileList.filter((metadataFile: DocChatMetadataFileWithIsSelected) => metadataFile.isSelected).map((metadataFile: DocChatMetadataFile) => metadataFile.file_id)
    }
    if (redoAll) {
      delete data['file_ids'];
    }

    this.fileProcessorSer.saveMetaData(data).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.showConfirmRepopulationAll = false;
      this.getMetadataFilesList();
    }
    )
  }

  confirmRepopulateAll(): void {
    this.showConfirmRepopulationAll = true;
  }

  handleOk(): void {
    this.repopulateMetadata(true);
  }
  handleCancel(): void {
    this.showConfirmRepopulationAll = false;
  }


  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.notification.create(
        'success',
        'Success',
        `${info.file.name} file uploaded successfully`,
        { nzPlacement: 'bottomLeft' }
      );
    } else if (info.file.status === 'error') {
      this.notification.create(
        'error',
        'Error',
        `${info.file.name} file upload failed.`,
        { nzPlacement: 'bottomLeft' }
      );
    }
  }


  getSummarySatus(): void {
    this.fileProcessorSer.getSummaryStatus(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.summaryPercentageValue = res.data.percentage_value;
      this.summaryFileUploaded = res.data.total_processed_files_count;
      this.summaryFileUploadedOutOf = res.data.total_files_count;
    })
  }

  getSummaryContent(): void {
    this.fileProcessorSer.getSummaryContent(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.shortSummary = res.data.summary_short;
      this.longSummary = res.data.summary_long;
    })
  }

  redoAllSummaries(updateRemaining: boolean = false): void {
    this.fileProcessorSer.redoAllSummaries({
      collection_id: this.collectionSelected!.collection_id,
      is_process_remainig: updateRemaining
    }).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
    }
    )
  }

  downloadSummery(): void {
    this.fileProcessorSer.downloadSummery(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.downloadCSV(res.data)
    })
  }

  downloadCSV(jsonData: any): void {
    const csv = this.convertToCSV(jsonData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.href = url;
    a.download = `${this.collectionSelected?.collection_name}_docChat_MetaData.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  convertToCSV(json: any[]): string {
    const header = Object.keys(json[0]).map(this.escapeCSVValue).join(',');
    const rows = json.map(obj => {
      return Object.values(obj).map(this.escapeCSVValue).join(',');
    });
    return header + '\n' + rows.join('\n');
  }

  escapeCSVValue(value: any): string {
    if (typeof value === 'string') {
      return '"' + value.replace(/"/g, '""') + '"';
    } else {
      return value;
    }
  }

  selectFile(event: MouseEvent, seletedIndex: number): void {
    if (this.metadataFileList[seletedIndex].isSelected) {
      this.metadataFileList[seletedIndex].isSelected = !this.metadataFileList[seletedIndex].isSelected
    } else {
      this.metadataFileList[seletedIndex].isSelected = !this.metadataFileList[seletedIndex].isSelected
      if (this.lastSelectedIndex !== null && event.shiftKey) {
        const start = Math.min(seletedIndex, this.lastSelectedIndex);
        const end = Math.max(seletedIndex, this.lastSelectedIndex);
        for (let i = start; i <= end; i++) {
          this.metadataFileList[i].isSelected = true;
        }
      }
      this.lastSelectedIndex = seletedIndex
    }
  }

  generateCustomInstructions() {
    this.fileProcessorSer.generateCustomInstructions(this.collectionSelected!.collection_id).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.customInstruction = res.data;
    })
  }

}

