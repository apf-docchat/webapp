import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChartsComponent } from './list-charts.component';

describe('ListChartsComponent', () => {
  let component: ListChartsComponent;
  let fixture: ComponentFixture<ListChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListChartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
