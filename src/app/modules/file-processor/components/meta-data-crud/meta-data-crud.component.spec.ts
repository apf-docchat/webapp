import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaDataCrudComponent } from './meta-data-crud.component';

describe('MetaDataCrudComponent', () => {
  let component: MetaDataCrudComponent;
  let fixture: ComponentFixture<MetaDataCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetaDataCrudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetaDataCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
