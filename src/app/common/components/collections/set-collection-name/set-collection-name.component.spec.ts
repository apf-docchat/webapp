import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCollectionNameComponent } from './set-collection-name.component';

describe('SetCollectionNameComponent', () => {
  let component: SetCollectionNameComponent;
  let fixture: ComponentFixture<SetCollectionNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetCollectionNameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetCollectionNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
