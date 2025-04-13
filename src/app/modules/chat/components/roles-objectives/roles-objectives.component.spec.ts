import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';

import { RolesObjectivesComponent } from './roles-objectives.component';
import { CollectionService } from '../../../../common/services/collection.service';import { of } from 'rxjs';

describe('RolesObjectivesComponent', () => {
  let component: RolesObjectivesComponent;
  let fixture: ComponentFixture<RolesObjectivesComponent>;
  let mockCollectionService: jasmine.SpyObj<CollectionService>;

  beforeEach(async () => {
    mockCollectionService = jasmine.createSpyObj('CollectionService', ['addInsight', 'getInsight']);
    
    await TestBed.configureTestingModule({
      declarations: [ RolesObjectivesComponent ],
      imports: [
        ReactiveFormsModule,
        NzCardModule,
        NzCollapseModule,
        NzRadioModule,
        NzButtonModule,
        NzInputModule,
        NzMessageModule
      ],
      providers: [
        { provide: CollectionService, useValue: mockCollectionService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesObjectivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a role', () => {
    const role = component.roles[0];
    component.selectRole(role);
    expect(component.selectedRole).toEqual(role);
  });

  it('should start editing', () => {
    const role = component.roles[0];
    component.selectedRole = role;
    component.startEditing();
    
    expect(component.isEditing).toBeTruthy();
    expect(component.editForm.get('roleText')?.value).toEqual(role.name);
    expect(component.editForm.get('objectivesText')?.value).toEqual(role.description);
  });

  it('should save role and objectives', () => {
    const mockInsight = { id: 1, data: 'test' };
    mockCollectionService.addInsight.and.returnValue(of({ data: mockInsight }));
    mockCollectionService.getInsight.and.returnValue(of({ data: mockInsight }));

    const role = component.roles[0];
    component.selectedRole = role;
    component.editForm.patchValue({
      roleText: 'Updated Role',
      objectivesText: 'Updated Objectives'
    });

    component.saveRoleAndObjectives();

    expect(mockCollectionService.addInsight).toHaveBeenCalled();
    expect(mockCollectionService.getInsight).toHaveBeenCalled();
  });
});