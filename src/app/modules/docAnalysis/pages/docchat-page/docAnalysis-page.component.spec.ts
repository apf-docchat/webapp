import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocAnalysisPageComponent } from './docAnalysis-page.component';

describe('DocAnalysisPageComponent', () => {
  let component: DocAnalysisPageComponent;
  let fixture: ComponentFixture<DocAnalysisPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocAnalysisPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocAnalysisPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
