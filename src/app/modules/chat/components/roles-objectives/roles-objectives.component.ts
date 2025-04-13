import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CollectionService } from '../../../../common/services/collection.service';

interface Role {
  id: number;
  role_name: string;
  objectives: string;
}

@Component({
  selector: 'app-roles-objectives',
  templateUrl: './roles-objectives.component.html',
  styleUrls: ['./roles-objectives.component.less'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NzCardModule,
    NzCollapseModule,
    NzRadioModule,
    NzButtonModule,
    NzInputModule,
    NzMessageModule,
    NzFormModule,
    NzDividerModule,
    NzIconModule
  ]
})
export class RolesObjectivesComponent implements OnInit {
  @Input() collectionSelected: any;

  roles: Role[] = [];

  selectedRole: Role | null = null;
  editedRole: Role | null = null;
  isEditing = false;
  isAdding = false;
  editForm: FormGroup;

  insights: { [key: number]: any } = {};
  username = '';

  private modal = inject(NzModalService);
  
  constructor(
    private fb: FormBuilder,
    private collectionSer: CollectionService,
    private message: NzMessageService
  ) {
    this.editForm = this.fb.group({
      roleText: ['', Validators.required],
      objectivesText: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.getRolesList();
    this.getCurrentRole();

    this.editForm = this.fb.group({
      roleText: ['', Validators.required],
      objectivesText: ['', Validators.required]
    });
  }

  getRolesList(): void {
    this.collectionSer.getRolesList(this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.roles = res.data;
      },
      error: (err) => {
        this.message.error('Failed to get roles');
      }
    });
  }

  getCurrentRole(): void {
    this.collectionSer.getCurrentRole(this.username).subscribe({
      next: (res: any) => {
        this.selectedRole = res.data;
        console.log(this.selectedRole);
      },
      error: (err: any) => {
        this.message.error(`Failed to get roles.${err}`);
      }
    });
  }

  selectRole(role: Role): void {
    this.editedRole = role;
  }

  onRoleChange(role: any): void {
    this.editedRole = role;
    this.cancelEditing();
  }

  startEditing(): void {
    this.isEditing = true;
    this.isAdding = false;
    if (this.editedRole) {
      this.editForm.patchValue({
        roleText: this.editedRole.role_name,
        objectivesText: this.editedRole.objectives
      });
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.isAdding = false;
    this.editForm.reset();
  }

  saveRoleAndObjectives(id: number): void {
    if (this.editForm.valid) {
      const roleData = {
        "role_name": this.editForm.value.roleText,
        "objectives": `${this.editForm.value.objectivesText}`,
        "username": this.username
      };

      // Call backend service similar to the example
      if (this.isAdding) {
        this.collectionSer.addRole(roleData).subscribe((res: any) => {
          this.roles.push(res.data);
          if (this.editedRole) {
            this.editedRole.id = res.data.id;
            this.editedRole.role_name = roleData.role_name;
            this.editedRole.objectives = roleData.objectives;
          }
          this.isEditing = false;
          this.isAdding = false;
        });
      } else {
        this.collectionSer.updateRole(id, roleData).subscribe((res: any) => {
          if (this.editedRole) {
            this.editedRole.role_name = roleData.role_name;
            this.editedRole.objectives = roleData.objectives;
          }
          this.isEditing = false;
        });
      }
    }
  }

  addRole(): void {
    this.isEditing = true;
    this.isAdding = true;
    this.editedRole = { id: 0, role_name: '', objectives: '' };
    this.editForm.reset();
  }

  deleteRole(id: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this role?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.collectionSer.deleteRole(id, this.username).subscribe((res: any) => {
          this.roles = this.roles.filter(role => role.id !== id);
          this.editedRole = null;
        });
      }
    });
  }

  chooseRole(role: any): void {
    this.collectionSer.updateUserRole(role.id, this.username).subscribe(() => {
      this.selectedRole = role;
    });
  }

}