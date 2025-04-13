import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNewsComponent } from './list-news.component';

describe('ListNewsComponent', () => {
  let component: ListNewsComponent;
  let fixture: ComponentFixture<ListNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListNewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
