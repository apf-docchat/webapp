import { Component, Input } from '@angular/core';
import { Article } from '../../models/article.model';
import { DatePipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [DatePipe, NzIconModule],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.less'
})
export class NewsCardComponent {

  @Input() article!: Article

  openLinkInNewTab(url: string): void {
    window.open(url, '_blank');
  }

}
