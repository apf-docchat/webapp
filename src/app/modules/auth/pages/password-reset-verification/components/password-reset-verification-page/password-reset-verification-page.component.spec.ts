import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetVerificationPageComponent } from './password-reset-verification-page.component';

describe('PasswordResetVerificationPageComponent', () => {
  let component: PasswordResetVerificationPageComponent;
  let fixture: ComponentFixture<PasswordResetVerificationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetVerificationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordResetVerificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
