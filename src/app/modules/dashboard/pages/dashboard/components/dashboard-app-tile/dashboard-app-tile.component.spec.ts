import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAppTileComponent } from './dashboard-app-tile.component';

describe('DashboardAppTileComponent', () => {
  let component: DashboardAppTileComponent;
  let fixture: ComponentFixture<DashboardAppTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAppTileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardAppTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
