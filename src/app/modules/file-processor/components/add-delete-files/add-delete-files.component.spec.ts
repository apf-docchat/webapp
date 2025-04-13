import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeleteFilesComponent } from './add-delete-files.component';

describe('AddDeleteFilesComponent', () => {
  let component: AddDeleteFilesComponent;
  let fixture: ComponentFixture<AddDeleteFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDeleteFilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDeleteFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
