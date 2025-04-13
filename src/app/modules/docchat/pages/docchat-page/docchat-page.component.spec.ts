import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocchatPageComponent } from './docchat-page.component';

describe('DocchatPageComponent', () => {
  let component: DocchatPageComponent;
  let fixture: ComponentFixture<DocchatPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocchatPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocchatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
