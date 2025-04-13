import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileProcessorPageComponent } from './file-processor-page.component';

describe('FileProcessorPageComponent', () => {
  let component: FileProcessorPageComponent;
  let fixture: ComponentFixture<FileProcessorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileProcessorPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileProcessorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
