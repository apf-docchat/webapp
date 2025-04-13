import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowErrorMessageComponent } from './show-error-message.component';

describe('ShowErrorMessageComponent', () => {
  let component: ShowErrorMessageComponent;
  let fixture: ComponentFixture<ShowErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowErrorMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
