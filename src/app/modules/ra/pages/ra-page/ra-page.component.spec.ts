import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaPageComponent } from './ra-page.component';

describe('RaPageComponent', () => {
  let component: RaPageComponent;
  let fixture: ComponentFixture<RaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
