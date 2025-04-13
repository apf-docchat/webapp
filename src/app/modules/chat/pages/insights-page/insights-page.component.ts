import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection, Insight, InsightMap } from '../../../../common/models/collection.model';
import { CollectionService } from '../../../../common/services/collection.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RolesObjectivesComponent } from "../../components/roles-objectives/roles-objectives.component";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-insights-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    RolesObjectivesComponent
  ],
  templateUrl: './insights-page.component.html',
  styleUrl: './insights-page.component.less'
})

export class InsightsPageComponent {

  constructor(private sanitizer: DomSanitizer) {}
  private collectionSer = inject(CollectionService)
  private modal = inject(NzModalService);

  collectionSelected: Collection | null = null;
  insights: InsightMap = {}
  //dataLoading: { [id: number]: boolean } = {};

  ngOnInit() {
    const storedCollection = localStorage.getItem('selectedCollection');
    if (storedCollection) {
      this.collectionSelected = JSON.parse(storedCollection);
      this.collectionSer.getInsightsList(this.collectionSelected?.collection_id || 0).subscribe((res: any) => {
        const insightsArray: Insight[] = res.data;
        insightsArray.forEach(insight => {
          this.insights[insight.id] = {
            id: insight.id,
            order_number: insight.order_number,
            title: insight.title,
            html_data: insight.html_data,
            image_data: insight.image_data,
            query: insight.query,
            dataLoading: false,
            updated_at: insight.updated_at
          };
          //this.dataLoading[insight.id] = true;
          /* this.collectionSer.getInsight(this.collectionSelected?.collection_id || 0, insight.id).subscribe((res: any) => {
            this.insights[insight.id] = res.data;
            this.insights[insight.id].dataLoading = false;
            //this.dataLoading[insight.id] = false;
          }); */
        });
        console.log('All Insights: ', this.insights);
      });
    }
  }

  addInsight(): void {
    console.log('Add Insight button clicked');
    this.collectionSer.addInsight(this.collectionSelected?.collection_id || 0).subscribe((res: any) => {
      console.log('New Insight added', res);
      const newInsight: Insight = res.data;
      this.insights[newInsight.id] = newInsight;
      this.insights[newInsight.id].dataLoading = false;
      //this.dataLoading[newInsight.id] = true;
      /* this.collectionSer.getInsight(this.collectionSelected?.collection_id || 0, newInsight.id).subscribe((res: any) => {
        this.insights[newInsight.id] = res.data;
        this.insights[newInsight.id].dataLoading = false;
        //this.dataLoading[newInsight.id] = false;
      }); */
    });
  }

  modifyInsight(insight: Insight, id: string): void {
    console.log('Modify Insight button clicked: ', insight, id);
    //find the id 
    this.collectionSer.updateInsight(this.collectionSelected?.collection_id || 0, id, insight.query).subscribe((res: any) => {
      //console.log('Insight modified', res);
      this.insights[Number(id)] = res.data;
      this.insights[Number(id)].dataLoading = true;
      this.collectionSer.getInsight(this.collectionSelected?.collection_id || 0, Number(id)).subscribe((res: any) => {
        this.insights[Number(id)] = res.data;
        this.insights[Number(id)].dataLoading = false;
        //this.dataLoading[newInsight.id] = false;
      });
    });
  }

  deleteInsight(id: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this insight?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.collectionSer.deleteInsight(this.collectionSelected?.collection_id || 0, id).subscribe(() => {
          delete this.insights[Number(id)];
        });
      }
    });
  }

  decodeHtml(html: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
