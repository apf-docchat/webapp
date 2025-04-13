import { Component, ViewContainerRef, inject, input } from '@angular/core';
import { FileProcessorService } from '../../services/file-processor.service';
import { DocGuideFaq, DocGuideFaqWithShowAnswer } from '../../../../common/models/docGuide_Faq.model';
import { Collection } from '../../../../common/models/collection.model';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AddFaqComponent } from './add-faq/add-faq.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    FormsModule,
    AddFaqComponent,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    NzEmptyModule,
    NzNotificationModule
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.less'
})
export class FaqComponent {

  collectionSelected = input.required<Collection>();

  private modalSer = inject(NzModalService);
  private viewContainerRef = inject(ViewContainerRef);
  private fileProcessorSer = inject(FileProcessorService);
  private notification = inject(NzNotificationService);

  faqList: DocGuideFaqWithShowAnswer[] = [];

  showEditModal: boolean = false;
  currentEditQuestion!: DocGuideFaq;

  ngOnInit() {
    this.getFaqs();
    // this.addFaqQuestions();
  }

  getFaqs() {
    this.fileProcessorSer.getFaqs(this.collectionSelected().collection_id).subscribe((res: any) => {
      this.faqList = res.data.map((faq: DocGuideFaq) => { return { ...faq, 'showAnswer': false } });
    })
  }

  addFaqQuestions() {
    const faqQuestionData = {
      "collection_id": this.collectionSelected().collection_id,
      "questions": [
        "what are the contents in this collection?"
      ]
    }
    this.fileProcessorSer.addFaqQuestions(faqQuestionData).subscribe((res: any) => {
      // console.log(res);
    })
  }

  editFaqQuestion() {
    const faqQuestionData = {
      "faq_id": this.currentEditQuestion.faq_id,
      "question": this.currentEditQuestion.faq_question,
    }
    this.fileProcessorSer.editFaqQuestions(faqQuestionData).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.showEditModal = false;
      this.getFaqs();
    })
  }

  deleteFaqQuestion(questionId: number) {
    const faqQuestionData = {
      "faq_ids": [questionId]
    }
    this.fileProcessorSer.deleteFaqQuestions(faqQuestionData).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.getFaqs();
    })
  }

  addFaqModel(): void {
    const modal = this.modalSer.create<AddFaqComponent>({
      nzTitle: 'Add FAQ',
      nzContent: AddFaqComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        collectionId: this.collectionSelected().collection_id
      },
      nzFooter: null
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.getFaqs();
      }
    });
  }

  showDeleteConfirm(questionId: number): void {
    this.modalSer.confirm({
      nzTitle: 'Are you sure delete this question?',
      nzContent: '<b style="color: red;">The question will be removed from FAQ</b>',
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteFaqQuestion(questionId),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  openEditModal(currentFaq: DocGuideFaq): void {
    this.currentEditQuestion = { ...currentFaq };
    this.showEditModal = true;
  }

  handleOk(): void {
    this.editFaqQuestion();

  }

  handleCancel(): void {
    this.showEditModal = false;
  }

  downloadFaqQuestions() {
    this.fileProcessorSer.downloadFaqQuestions(this.collectionSelected().collection_id).subscribe((res: any) => {
      this.downloadCSV(res.data)
    })
  }

  downloadCSV(jsonData: any) {
    const csv = this.convertToCSV(jsonData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'data.csv';
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
}
