import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCollectionFilesComponent } from './list-collection-files.component';

describe('ListCollectionFilesComponent', () => {
  let component: ListCollectionFilesComponent;
  let fixture: ComponentFixture<ListCollectionFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCollectionFilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListCollectionFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
