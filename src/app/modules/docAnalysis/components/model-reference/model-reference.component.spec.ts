import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelReferenceComponent } from './model-reference.component';

describe('ModelReferenceComponent', () => {
  let component: ModelReferenceComponent;
  let fixture: ComponentFixture<ModelReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelReferenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
