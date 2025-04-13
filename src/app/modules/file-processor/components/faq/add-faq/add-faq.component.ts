import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FileProcessorService } from '../../../services/file-processor.service';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-add-faq',
  standalone: true,
  imports: [FormsModule, NzInputModule, NzButtonModule, NzNotificationModule],
  templateUrl: './add-faq.component.html',
  styleUrl: './add-faq.component.less'
})
export class AddFaqComponent {

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: { collectionId: number } = inject(NZ_MODAL_DATA);
  private notification = inject(NzNotificationService);
  private fileProcessorSer = inject(FileProcessorService);

  faqQuestion: string[] = [''];

  removeQuestion(index: number): void {
    if (index != 0) {
      this.faqQuestion.splice(index, 1);
    }
  }

  addMoreQuestions(): void {
    this.faqQuestion.push('');
  }

  addFaqQuestions() {
    const isArrayItemEmpty = this.faqQuestion.filter(faq => faq.trim() === '');

    if (isArrayItemEmpty.length > 0) {
      this.notification.create(
        'warning',
        'Warning',
        'Question cannot be empty',
        { nzPlacement: 'bottomLeft' }
      );
      return;
    }

    const faqQuestionData = {
      "collection_id": this.nzModalData.collectionId,
      "questions": this.faqQuestion
    }
    this.fileProcessorSer.addFaqQuestions(faqQuestionData).subscribe((res: any) => {
      this.notification.create(
        'success',
        'Success',
        res.message,
        { nzPlacement: 'bottomLeft' }
      );
      this.#modal.destroy(true);
    })
  }
}
