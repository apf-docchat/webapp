import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OrganizationService } from '../../services/organization.service';
import { Collection, module } from '../../../../common/models/collection.model';
import { HeaderComponent } from '../../../../common/components/header/header.component';


export interface Organization {
  organization_id: number;
  organization_name: string;
  role: string;
  moduleList?: string; // Optional property to store CSV string
}

export interface User {
  user_id: number;
  username: string;
  password: string;
  email: string;
  organizations: UserOrganization[];
}

export interface UserOrganization {
  organization_id: number;
  role: string;
}

interface Prompt {
  id: number;
  prompt_name: string;
  name_label: string;
  prompt_text: string;
  description: string;
  prompt_type: string;
  archivedPrompts: ArchivedPrompt[];
}

interface ArchivedPrompt {
  id: number;
  prompt_id: number;
  prompt_type: string;
  prompt_name: string;
  name_label: string;
  prompt_text: string;
  description: string;
  datetime_created: string;
}

@Component({
  selector: 'app-admin-functions',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzTabsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    FormsModule,
    NzSelectModule,
    NzCardModule,
    NzDropDownModule,
    HeaderComponent
  ],
  providers: [NzModalService],
  templateUrl: './admin-functions.component.html',
  styleUrls: ['./admin-functions.component.less']
})
export class AdminFunctionsComponent {
  organizationList : Organization[] = [];
  userIssueList: any = [];
  filteredUserIssueList: any[] = [];
  selectedStatus: string = '';

  userList :User[] = [];

  prompt: Prompt[] = [];
  filteredPrompts: Prompt[] = [];
  promptTypes: string[] = [];
  selectedPromptType: string = '';
  selectedArchivedPrompt: { [key: number]: ArchivedPrompt } = {};
  archivedPrompt: { [key: number]: ArchivedPrompt } = {};
  chatLog: any[] = [];

  orgName: string = '';
  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userRole: string = '';
  userOrganizations: UserOrganization[] = [];

  @ViewChild('createOrganizationTemplate', { static: true }) createOrganizationTemplate!: TemplateRef<any>;
  @ViewChild('createUserTemplate', { static: true }) createUserTemplate!: TemplateRef<any>;

  constructor(
    private modal: NzModalService,
    private organizationService: OrganizationService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.getOrgsList();
    this.getUsersList();
    this.getPrompts();
    this.getIssues();
  }

  async getOrgsList() {
    try {
      const res = await this.organizationService.getOrgList();
      this.organizationList = res.data;
      console.log(this.organizationList);

      // Loop through each organization to fetch its module list
      for (const org of this.organizationList) {
        this.getModuleList(org.organization_id);
      }
    } catch (error) {
      console.error('Error fetching organization list:', error);
    }
  }

  async getUsersList() {
    try {
      const res = await this.organizationService.getUserList();
      this.userList = res.data;
      console.log(this.userList);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  }

  getModuleList(organization_id: number) {
    this.organizationService.getModuleList(organization_id).subscribe(
      (res: any) => {
        const moduleIds = res.data.map((module: any) => module.module_id).join(',');
        const orgIndex = this.organizationList.findIndex(org => org.organization_id === organization_id);
        if (orgIndex !== -1) {
          this.organizationList[orgIndex].moduleList = moduleIds;
        }
      },
      (error) => {
        console.error(`Error fetching module list for organization ${organization_id}:`, error);
      }
    );
  }

  async getPrompts() {
    // Fetch prompts from the backend and populate the prompt array
    // Example:
    /* this.prompt = [
     { id: 1, prompt_name: 'Prompt 1a', name_label: 'Label 1a', prompt_text: 'Text 1a', description: 'Description 1a', prompt_type: 'Type 1' },
     { id: 2, prompt_name: 'Prompt 1b', name_label: 'Label 1b', prompt_text: 'Text 1a', description: 'Description 1a', prompt_type: 'Type 1' },
       { id: 3, prompt_name: 'Prompt 2', name_label: 'Label 2', prompt_text: 'Text 2', description: 'Description 2', prompt_type: 'Type 2' }
     ]; */
    const res = await this.organizationService.getPrompts()
    this.prompt = res.data;
    this.promptTypes = [...new Set(this.prompt.map(p => p.prompt_type))];
    this.filterPrompts();
  }

  async getIssues() {
    try {
      const res = await this.organizationService.getIssues();
      this.userIssueList = res.data.map((item: any) => {
        const parsedData = JSON.parse(item.data);
        return { ...parsedData, id: item.id };
      });
      this.filterIssues();
      console.log(this.filteredUserIssueList);
    } catch (error) {
      console.error('Error fetching User Issues list:', error);
    }
  }

  filterIssues(): void {
    console.log('Filtering issues by status:', this.selectedStatus);
    if (this.selectedStatus) {
      this.filteredUserIssueList = this.userIssueList.filter((issue: any) => issue.status === this.selectedStatus);
    } else {
      this.filteredUserIssueList = [...this.userIssueList];
    }
  }

  saveIssue(userIssue: any, id: string): void {
    // Call the backend service to save the updated remarks
    this.organizationService.updateUserIssue(id, JSON.stringify(userIssue)).subscribe(() => {
      console.log('Remarks updated for ticket number:', userIssue.ticket_number);
    });
  }

  filterPrompts() {
    this.filteredPrompts = this.prompt.filter(p => p.prompt_type === this.selectedPromptType);
  }

  viewArchivedPrompt(promptId: number) {
    this.archivedPrompt[promptId] = this.selectedArchivedPrompt[promptId];
  }

  savePrompt(promptId: number) {
    const prompt = this.prompt.find(p => p.id === promptId);
    if (prompt) {
      this.organizationService.savePrompt(prompt).subscribe(
        (response) => {
          if (typeof response.error === 'undefined') {
            this.modal.success({
              nzTitle: 'Success',
              nzContent: response.message
            });
          } else {
            this.modal.error({
              nzTitle: 'Error',
              nzContent: response.error
            });
          }
        },
        (error) => {
          this.modal.error({
            nzTitle: 'Error',
            nzContent: 'Failed to save prompt.'
          });
        }
      );
    }
  }

  openCreateOrganizationModal() {
    this.modal.create({
      nzTitle: 'Create Organization',
      nzContent: this.createOrganizationTemplate,
      nzOnOk: () => this.createOrganization()
    });  

  }

  createOrganization() {
    if (!this.orgName) {
      this.modal.error({
        nzTitle: 'Error',
        nzContent: 'Organization name is required.'
      });
      return;
    }

    this.organizationService.createOrganization(this.orgName).subscribe(
      (response) => {
        if (typeof response.error === 'undefined') {
          this.modal.success({
            nzTitle: 'Success',
            nzContent: response.message
          });
          this.getOrgsList();
        } else {
          this.modal.error({
            nzTitle: 'Error',
            nzContent: response.error
          });
        }
      },
      (error) => {
        console.log(error)
        this.modal.error({
          nzTitle: 'Error',
          nzContent: error.message
        });
      }
    );
  }

  saveOrgName(organization_id: number) {
    this.organizationService.saveOrgName(organization_id.toString(),  this.organizationList.find(org => org.organization_id === organization_id)?.organization_name || '').subscribe(
      (response) => {
        if (typeof response.error === 'undefined') {
          this.modal.success({
            nzTitle: 'Success',
            nzContent: response.message
          });
        } else {
          this.modal.error({
            nzTitle: 'Error',
            nzContent: response.error
          });
        }
      },
      (error) => {
        console.log(error)
        this.modal.error({
          nzTitle: 'Error',
          nzContent: error.message
        });
      }
    );
  }


  saveModuleList(organization_id: number) {
    this.organizationService.addModulesToOrganization(organization_id.toString(), this.organizationList.find(org => org.organization_id === organization_id)?.moduleList || '').subscribe(
      (response) => {
        if (typeof response.error === 'undefined') {
          this.modal.success({
            nzTitle: 'Success',
            nzContent: response.message
          });
        } else {
          this.modal.error({
            nzTitle: 'Error',
            nzContent: response.error
          });
        }
      },
      (error) => {
        console.log(error)
        this.modal.error({
          nzTitle: 'Error',
          nzContent: error.message
        });
      }
    );
  }

  openEditOrganizationModal(org: any) {
    // Logic to open modal for editing an organization
  }

  deleteOrganization(orgId: number) {
    // Logic to delete an organization
  }

  openCreateUserModal() {
    this.modal.create({
      nzTitle: 'Create User',
      nzContent: this.createUserTemplate,
      nzOnOk: () => this.createUser()
    });
  }

  createUser() {
    if (!this.userName || !this.userEmail || !this.userPassword) {
      this.modal.error({
        nzTitle: 'Error',
        nzContent: 'All fields are required.'
      });
      return;
    }

    const newUser: User = {
      user_id: 0, // This will be set by the backend
      username: this.userName,
      password: this.userPassword,
      email: this.userEmail,
      organizations: this.userOrganizations
    };

    this.organizationService.createUser(newUser.username, newUser.password, newUser.email).subscribe(
      (response) => {
        if (typeof response.error === 'undefined') {
          this.modal.success({
            nzTitle: 'Success',
            nzContent: response.message
          });
          this.getUsersList();
        } else {
          this.modal.error({
            nzTitle: 'Error',
            nzContent: response.error
          });
        }
      },
      (error) => {
        console.log(error)
        this.modal.error({
          nzTitle: 'Error',
          nzContent: error.message
        });
      }
    );
  }

  saveUserName(userId: number) {
    const user = this.userList.find(u => u.user_id === userId);
    if (user) {
      this.organizationService.saveUserName(userId.toString(), user.username).subscribe(
        (response) => {
          if (typeof response.error === 'undefined') {
            this.modal.success({
              nzTitle: 'Success',
              nzContent: response.message
            });
          } else {
            this.modal.error({
              nzTitle: 'Error',
              nzContent: response.error
            });
          }
        },
        (error) => {
          console.log(error)
          this.modal.error({
            nzTitle: 'Error',
            nzContent: error.message
          });
        }
      );
    }
  }

  saveEmail(userId: number) {
    const user = this.userList.find(u => u.user_id === userId);
    if (user) {
      this.organizationService.saveEmail(userId.toString(), user.email).subscribe(
        (response) => {
          if (typeof response.error === 'undefined') {
            this.modal.success({
              nzTitle: 'Success',
              nzContent: response.message
            });
          } else {
            this.modal.error({
              nzTitle: 'Error',
              nzContent: response.error
            });
          }
        },
        (error) => {
          console.log(error)
          this.modal.error({
            nzTitle: 'Error',
            nzContent: error.message
          });
        }
      );
    }
  }

  /* saveUserOrganizations(userId: number) {
    const user = this.userList.find(u => u.id === userId);
    if (user) {
      this.organizationService.saveUserOrganizations(userId.toString(), user.organizations).subscribe(
        (response) => {
          if (typeof response.error === 'undefined') {
            this.modal.success({
              nzTitle: 'Success',
              nzContent: response.message
            });
          } else {
            this.modal.error({
              nzTitle: 'Error',
              nzContent: response.error
            });
          }
        },
        (error) => {
          console.log(error)
          this.modal.error({
            nzTitle: 'Error',
            nzContent: error.message
          });
        }
      );
    }
  } */

  openEditUserModal(user: any) {
    // Logic to open modal for editing a user
  }

  async showChatLog(thread_id: string) {
    try {
      const res = await this.organizationService.getChatLog(thread_id);
      this.chatLog = res.data.messages.map((message: any) => ({
        role: message.role,
        content: message.content
      }));
      console.log(this.chatLog);

    } catch (error) {
      console.error('Error fetching Chat logs:', error);
    }   
  }

  async populateDashboard(org: Organization) {
    try {
      const res = await this.organizationService.populateDashboard(org.organization_id.toString());
      const message = res.data.message;
      console.log(message);

    } catch (error) {
      console.error('Error Populating Dashboard:', error);
    }
  }

  decodeHtml(html: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  }
  
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
}