import { Component } from '@angular/core';
import { ListNewsComponent } from '../../components/list-news/list-news.component';
import { ChatScreenComponent } from '../../../ra/components/chat-screen/chat-screen.component';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { ListChartsComponent } from '../../components/list-charts/list-charts.component';


@Component({
  selector: 'app-news-scraping',
  standalone: true,
  imports: [ListNewsComponent, HeaderComponent, ChatScreenComponent, ListChartsComponent, NzSegmentedModule],
  templateUrl: './news-scraping.component.html',
  styleUrl: './news-scraping.component.less'
})
export class NewsScrapingComponent {

  currentTab = 0;

  defaultOptions = [
    { label: 'News', value: 'News', icon: 'bars' },
    { label: 'Analytics', value: 'Analytics', icon: 'appstore' }
  ];


  handleIndexChange(e: number): void {
    this.currentTab = e
  }

}
