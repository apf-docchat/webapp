import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionFileListComponent } from './collection-file-list.component';

describe('CollectionFileListComponent', () => {
  let component: CollectionFileListComponent;
  let fixture: ComponentFixture<CollectionFileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionFileListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
