import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsScrapingComponent } from './news-scraping.component';

describe('NewsScrapingComponent', () => {
  let component: NewsScrapingComponent;
  let fixture: ComponentFixture<NewsScrapingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsScrapingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsScrapingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
