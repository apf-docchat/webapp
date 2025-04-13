import { Component, inject } from '@angular/core';
import { NewsscrapingService } from '../../services/news-scraping.service';
import { Article } from '../../models/article.model';
import { NewsCardComponent } from '../news-card/news-card.component';
import { articleList } from '../../../../common/dummyData/dummyData';


@Component({
  selector: 'app-list-news',
  standalone: true,
  imports: [NewsCardComponent],
  templateUrl: './list-news.component.html',
  styleUrl: './list-news.component.less'
})
export class ListNewsComponent {
  articleList: Article[] = articleList

  newsScrapingSer = inject(NewsscrapingService)
  ngOnInit() {
    // this.newsScrapingSer.getArticlesList().subscribe((res: any) => {
    //   console.log(res);

    //   this.articleList = res.data
    //   console.log(this.articleList);
    // })
  }
}
