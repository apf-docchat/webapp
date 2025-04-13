import { ComponentFixture, TestBed } from '@angular/core/testing';
import { docInsightPageComponent } from './docInsight-page.component';


describe('DocchatPageComponent', () => {
  let component: docInsightPageComponent;
  let fixture: ComponentFixture<docInsightPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [docInsightPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(docInsightPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
