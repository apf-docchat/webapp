import { Component, inject } from '@angular/core';
import { DocGuideSection } from '../../../../common/models/doc-guide.model';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

import { SectionChatService } from '../../services/section-chat.service';
import { ChatScreenComponent } from './components/chat-screen/chat-screen.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-section-chat',
  standalone: true,
  imports: [
    ChatScreenComponent,
    NzIconModule,
    NzProgressModule
  ],
  templateUrl: './section-chat.component.html',
  styleUrl: './section-chat.component.less'
})
export class SectionChatComponent {
  private sectionChatSer = inject(SectionChatService);
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  // section variables
  selectedIndex: number = 0;
  sectionSelected: DocGuideSection | null = null;
  sectionsList: DocGuideSection[] = []

  constructor() {
    this.getSectionsFiles()
  }

  ngOnInit() {}

  getSectionsFiles() {
    this.sectionChatSer.getDocGuildeFileSectionList(this.nzModalData.fileId).subscribe((res: any) => {
      this.sectionsList = res.data
    })
  }

  onSectionSelection(section: DocGuideSection) {
    if (!section.is_enabled) {
      return
    }
    this.sectionSelected = section
  }

  reAssignSectionChat(sectionId: number | null) {
    if (sectionId === null) {
      this.sectionSelected = null;
    } else {
      const newSection = this.sectionsList.find(section => sectionId === section.section_id)
      if (newSection) {
        this.sectionSelected = null;
        setTimeout(() => {
          this.sectionSelected = newSection;
        }, 10);
      }
    }
  }



  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }
}
