import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCollectionFilesComponent } from './select-collection-files.component';

describe('SelectCollectionFilesComponent', () => {
  let component: SelectCollectionFilesComponent;
  let fixture: ComponentFixture<SelectCollectionFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCollectionFilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectCollectionFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
