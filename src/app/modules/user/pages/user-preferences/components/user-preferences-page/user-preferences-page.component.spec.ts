import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencesPageComponent } from './user-preferences-page.component';

describe('UserPreferencesPageComponent', () => {
  let component: UserPreferencesPageComponent;
  let fixture: ComponentFixture<UserPreferencesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPreferencesPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPreferencesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
