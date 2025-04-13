import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsauthComponent } from './msauth.component';

describe('MsauthComponent', () => {
  let component: MsauthComponent;
  let fixture: ComponentFixture<MsauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsauthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MsauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
