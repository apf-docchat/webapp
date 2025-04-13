import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLoadingComponent } from './chat-loading.component';

describe('ChatLoadingComponent', () => {
  let component: ChatLoadingComponent;
  let fixture: ComponentFixture<ChatLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatLoadingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
