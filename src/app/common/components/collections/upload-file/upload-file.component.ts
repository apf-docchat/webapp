import { Component, EventEmitter, Output, Input, inject, ViewContainerRef } from '@angular/core';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserAuthService } from '../../../services/user-auth.service';
import { CollectionService } from '../../../services/collection.service';
import { EnvConfigService } from '../../../services/env-config.service';
import { Collection } from '../../../models/collection.model';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ShowErrorMessageComponent } from '../../../../modules/docAnalysis/components/show-error-message/show-error-message.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [NzUploadModule, NzButtonModule, NzDividerModule, FormsModule, NzInputModule, NzIconModule],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.less'
})
export class UploadFileComponent {
  apiBaseUrl = '';
  uploadUrl = `${this.apiBaseUrl}collection/file`
  token = ''
  orgId = ''
  url = '';
  @Input() collection: Collection | undefined;
  //@Output() returnValue = new EventEmitter<boolean>();
  @Output() returnValue = new EventEmitter<{ success: boolean, collectionName: string}>();

  private nzModelSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  fileList: any[] = []

  SUPPORTED_MODULES: { [key: string]: string } = {
    'docchat': '.docx, application/pdf, .txt, .doc, .ppt, .pptx, .xls, .xlsx, .csv',
    'dataanalysis': '.csv, .xlsx',
    'esgreporting': 'application/pdf',
    'procurement': 'application/pdf',
    'filewizard': 'application/pdf, .docx, .doc, .ppt, .pptx, .xls, .xlsx, .csv',
    'docguide': '.docx, application/pdf, .txt, .doc, .ppt, .pptx, .xls, .xlsx, .csv',
    'newsscraping': 'application/pdf',
    'askdoc': '.docx, application/pdf, .txt, .doc, .ppt, .pptx, .xls, .xlsx, .csv',
    'docanalysis': '.xls, .xlsx, .csv'
  };
  allowedExtensions: string = 'application/pdf';

  constructor(
    private userAuthSer: UserAuthService,
    private collectionSer: CollectionService,
    private notification: NzNotificationService,
    private envConfig: EnvConfigService,
    private http: HttpClient
  ) {
    this.apiBaseUrl = this.envConfig.apiBaseUrl
    this.uploadUrl = `${this.apiBaseUrl}/collection/file`
  }

  ngOnInit() {
    this.orgId = this.userAuthSer.getOrgId()!
    this.token = `Bearer ${this.userAuthSer.getUserToken()!}`
    this.allowedExtensions = this.SUPPORTED_MODULES[this.collection?.module_type!];
  }

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      // console.log('not uploading status');
    }
    if (info.file.status === 'done') {
      // console.log('upload done');
      // this.msg.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      // console.log('upload error');

      // this.msg.error(`${info.file.name} file upload failed.`);
    }
  }

  callUploadUrl() {
    if (this.url !== "") {
      const formData: FormData = new FormData();
      formData.append('url', this.url);
      formData.append('collection_id', this.collection?.collection_id.toString()!);
      this.collectionSer.uploadFile(formData).subscribe((res: any) => {
        this.notification.create(
          'success',
          'Success',
          res.message,
          { nzPlacement: 'bottomLeft' }
        );
      })
    }

  }

  customUpload = (item: NzUploadXHRArgs): Subscription => {
    // Check if the URL ends with xls, xlsx, or csv
    const fileName = item.file.name.toLowerCase();
    if (
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".csv")
    ) {
      // call for spreadsheet data validation
      return this.onChange(item);
    } else {

      const formData = new FormData();
      formData.append('file', item.file as any);
    
      const headers = new HttpHeaders({
        'Authorization': this.token,
        'organization-id': this.orgId
      });
    
      const uploadUrlWithParams = `${this.uploadUrl}?collection_id=${this.collection?.collection_id}`;
    
      return this.http.post(uploadUrlWithParams, formData, { headers }).subscribe(
        (res: any) => {
          console.log('res', res);
          item.onSuccess!(res, item.file!, res);
          if (!res.error) {
            this.notification.create(
              'success',
              'Success',
              res['message'],
              { nzPlacement: 'bottomLeft' }
            );
          } else {
            item.onError!(res, item.file!);
            // Extract the error message
            let errorMessage = 'File upload failed';
            if (res.error) {
              if (typeof res.error === 'string') {
                errorMessage = res.error;
              } else if (res.error.message) {
                errorMessage = res.error.message;
              } else if (res.error.error) {
                errorMessage = res.error.error;
              }
            }
            this.notification.create(
              'error',
              'Error',
              errorMessage,
              { nzPlacement: 'bottomLeft' }
            );
          }
        },
        (err: any) => {
          console.log('err', err);
          item.onError!(err, item.file!);
          // Extract the error message
          let errorMessage = 'File upload failed';
          if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            }
          }
          this.notification.create(
            'error',
            'Error',
            errorMessage,
            { nzPlacement: 'bottomLeft' }
          );
        }
      );
    }
  }

  onChange(item: NzUploadXHRArgs): Subscription {
    // The raw File is typically in postFile
    const rawFile = item.postFile as File;
    if (!rawFile) {
      console.error('No file detected.');
      return new Subscription();
    }
  
    // Check the file extension
    const fileExtension = (rawFile.name.split('.').pop() ?? '').toLowerCase();
  
    if (['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      console.log('Valid file selected:', rawFile.name);
  
      // Open your modal and pass in any necessary data
      const modal = this.nzModelSer.create<ShowErrorMessageComponent, any>({
        nzTitle: 'Uploading : ' + rawFile.name,
        nzContent: ShowErrorMessageComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: {
          // Pass the file to the modal
          file: rawFile
        },
        nzFooter: null,
        nzCentered: true,
        nzWidth: 600,
        nzBodyStyle: {
          'max-height': '85vh'
        }
      });
  
      // Reload the file list after the modal closes, if needed
      modal.afterClose.subscribe(result => {
        if (result) {
          console.log('File uploaded successfully');
          item.onSuccess?.({}, item.file!, {});
          this.collectionSer
            .getUploadedFileList('?collection_name=' + this.collection?.collection_name)
            .subscribe((res: any) => {
              this.fileList = res.data[0].files;
            });
        } else {
          console.log('Error uploading file');
          item.onError?.({}, item.file!);
        }
      });
    } else {
      console.error('Invalid file type. Please select a CSV or Excel file.');
    }
  
    return new Subscription();
  }

  backToScreen(value: boolean) {
    //this.returnValue.emit(value);
    this.returnValue.emit({ success: value, collectionName: this.collection?.collection_name! });
  }
}
