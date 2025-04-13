import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionMgmtComponent } from './collection-mgmt.component';

describe('DashboardPageComponent', () => {
  let component: CollectionMgmtComponent;
  let fixture: ComponentFixture<CollectionMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionMgmtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
