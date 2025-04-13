import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Collection, Job, JobMap } from '../../../../common/models/collection.model';
import { CollectionService } from '../../../../common/services/collection.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { marked } from 'marked';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzIconModule,
    NzSelectModule,
    NzButtonModule,
    NzInputModule,
    NzNotificationModule,
    NzCollapseModule
  ],
  templateUrl: './jobs-page.component.html',
  styleUrl: './jobs-page.component.less'
})

export class JobsPageComponent {

  constructor(
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private notification: NzNotificationService,
  ) {}
  private collectionSer = inject(CollectionService)
  private modal = inject(NzModalService);
  stepsForm: { [jobId: number]: FormGroup } = {};
  jobsForm: { [jobId: number]: FormGroup } = {};
  jobInputsMap: { [jobId: number]: string } = {};

  collections: Collection[] = [];
  allCollections: Collection[] = [];
  collectionSelected: Collection | null = null;
  jobs: JobMap = {}
  //dataLoading: { [id: number]: boolean } = {};
  username = localStorage.getItem('username') || 'User';
  steps: string = '';
  newJobCollectionId: string = '';

  selected_file_ids: string[] | null = [];
  fileList: any[] = [{
    "file_id": "",
    "file_name": "Select All",
    "file_url": "",
    "file_upload_datetime": ""
  }];
  toolList: any[] = [
    {"tool_id": "1","tool_name": "Text Document Processing", "textarea_label": "Describe the Query/Processing to be done", "textarea_placeholder": "What process to do...", "output_format_flag": true},
    {"tool_id": "2","tool_name": "Data Analysis", "textarea_label": "Describe the Analysis to be done on the Input", "textarea_placeholder": "What analysis to do...", "output_format_flag": true},
    {"tool_id": "3","tool_name": "Metadata Generator", "textarea_label": "Describe the Metadata to be generated", "textarea_placeholder": "List the Fields and describe the fields if necessary", "output_format_flag": true},
    {"tool_id": "4","tool_name": "Filter Files", "textarea_label": "Describe the Filter to be applied on the Input Files", "textarea_placeholder": "Describe the filter to apply...", "output_format_flag": false},
    {"tool_id": "5","tool_name": "Send email", "textarea_label": "Enter Email details (YAML format)", "textarea_placeholder": "email_subject:Your Subject\nemail_to:abcd1@xyz.com, abcd2@xyz.com", "output_format_flag": false},
    /* {"tool_id": "6","tool_name": "LLM call"},
    {"tool_id": "7","tool_name": "Web Search"}, */
  ];
  //selectedToolId: string = '';

  selectedJobKey: number | null = null; 
  @ViewChild('buildAgentTemplate', { static: true }) buildAgentTemplate!: TemplateRef<any>;
  selectCollectionOptions: Collection[] = [];

  ngOnInit() {
    //load from locastorage collections array to collections var
    this.collections = JSON.parse(localStorage.getItem('collections') || '[]');

    const storedCollection = localStorage.getItem('selectedCollection');
    /* if (storedCollection) {
      this.collectionSelected = JSON.parse(storedCollection);
    }
    this.collectionSer.getJobsList(this.collectionSelected?.collection_id).subscribe((res: any) => { */
    this.collectionSer.getJobsList().subscribe((res: any) => {
      console.log('getjobslist returned...');
      const jobsArray: Job[] = res.data;
      jobsArray.forEach(job => {
        console.log('Job: ', job);
        this.jobsForm[job.id] = this.fb.group({
          job_collection_id: [job.job_collection_id, Validators.required],
          query: [job.query, Validators.required],
          api_endpoint: [job.api_endpoint]
        });

        this.jobs[job.id] = {
          id: job.id,
          job_collection_id: job.job_collection_id,
          query: job.query,
          order_number: job.order_number,
          title: job.title,
          html_steps_data: job.html_steps_data || {},
          image_steps_data: job.image_steps_data || {},
          steps: job.steps,
          api_endpoint: job.api_endpoint,
          dataLoading: false
        };

        //this.runJob(job.id.toString());
        const steps = JSON.parse(job.steps || '[]');
        this.setSteps(Number(job.id), steps);
      });
      console.log('All Jobs: ', this.jobs);
    });

    const selectedCollection = localStorage.getItem('selectedCollection');
    if (selectedCollection) {
      this.fileList = JSON.parse(selectedCollection).files;
      this.fileList.unshift({
        "file_id": "",
        "file_name": "Select All",
        "file_url": "",
        "file_upload_datetime": ""
      });
    }
    console.log('File List: ', this.fileList);
  }

  /* runJob(jobId: string) {
    this.collectionSer.getJob(Number(jobId)).subscribe((res: any) => {
      console.log('Job output: ', res.data);
      console.log('html for jobId: ', res.data.html_steps_data);
      this.jobs[Number(jobId)].html_steps_data = res.data.html_steps_data;
      this.jobs[Number(jobId)].image_steps_data = res.data.image_steps_data || {};
      this.jobs[Number(jobId)].steps = res.data.steps;
      this.jobs[Number(jobId)].query = res.data.query;
      this.jobs[Number(jobId)].job_collection_id = res.data.job_collection_id;
      this.jobs[Number(jobId)].dataLoading = false;
      let steps = JSON.parse(this.jobs[Number(jobId)].steps || '[]');
      //console.log(steps);
      this.setSteps(Number(jobId), steps);
    });
  } */

  setSteps(jobId: number, steps: any[]) {
    this.stepsForm[jobId] = this.fb.group({
      steps: this.fb.array([])
    });
    const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
    console.log(steps);
    steps?.forEach(step => {
      console.log('Step: ', step);
      const stepFormGroup = this.fb.group({
        id: [step.id],
        step_type: [step.step_type],
        file_category: [step.file_category, Validators.required],
        //input_files: [step.input_files, Validators.required],
        tool_id: [step.tool_id],
        prompt: [step.prompt, Validators.required],
        output_format: [step.output_format],
        selected_file_ids: []
      })
      stepsFormArray.push(stepFormGroup);
    });
  }

  addStep(jobId: number) {
    const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;

    stepsFormArray.push(this.fb.group({
      id: [''],
      step_type: [''],
      file_category: ['', Validators.required],
      tool_id: ['', Validators.required],
      prompt: ['', Validators.required],
      output_format: ['Share in html format'],
      selected_file_ids: []
    }));
  }

  removeStep(jobId: number, index: number) {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Step?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
        stepsFormArray.removeAt(index);
      }
    });
  }

  openBuildAgentModal() {
    const localStorageData = JSON.parse(localStorage.getItem('allCollections') || '{}');
    this.allCollections = Object.values(localStorageData).flat() as Collection[];

    //Use the allCollections var to dynamically create an array of options for the select dropdown
    this.selectCollectionOptions = this.allCollections.map(collection => ({
      collection_name: collection.collection_name,
      collection_id: collection.collection_id,
      description: collection.description,
      collection_description: collection.collection_description,
      is_private: collection.is_private,
      module_id: collection.module_id,
      module_name: collection.module_name,
      module_type: collection.module_type,
      files: [],
      tables: [],
    }));
    this.modal.create({
      nzTitle: 'Build Agent',
      nzContent: this.buildAgentTemplate,
      nzOnOk: () => {
        // Perform validation before proceeding
        if (this.newJobCollectionId === '') {
          this.notification.create(
            'warning',
            'Warning',
            'Select a Collection to add a new Job.',
            { nzPlacement: 'top' }
          );
          return Promise.reject(); // Prevent the modal from closing
        }
  
        // Proceed with adding the job
        return this.addJob();
      }
    });  
  }

  addJob(): void {
    console.log('Add Job button clicked');
    //if select with id=new_job_collection_id not selected don't proceed
    /* if (this.newJobCollectionId === '') {
      this.notification.create(
        'warning',
        'Warning',
        'Select a Collection to add a new Job.',
        { nzPlacement: 'top' }
      );
      return;
    } */
    this.collectionSer.addJob(this.username, this.newJobCollectionId).subscribe((res: any) => {

      this.jobsForm[res.data.id] = this.fb.group({
        job_collection_id: [res.data.job_collection_id, Validators.required],
        query: [res.data.query, Validators.required],
        api_endpoint: [res.data.api_endpoint]
      });

      this.jobs[res.data.id] = {
        id: res.data.id,
        job_collection_id: res.data.job_collection_id,
        query: res.data.query,
        order_number: res.data.order_number,
        title: res.data.title,
        html_steps_data: {},
        image_steps_data: {},
        steps: res.data.steps,
        api_endpoint: res.data.api_endpoint,
        dataLoading: false
      };
      this.setSteps(res.data.id, res.data.steps);
      /* this.collectionSer.getJob(res.data.id).subscribe((res: any) => {
        this.jobs[res.data.id] = {
          id: res.data.id,
          order_number: res.data.order_number,
          title: res.data.title,
          html: '',
          image_data: '',
          steps: res.data.steps,
          dataLoading: true
        };
      }); */
    });
  }

  createStepsInternal(jobId: number) {
    const collectionIdControl = this.jobsForm[jobId].get('job_collection_id') as FormArray;
    const queryControl = this.jobsForm[jobId].get('query') as FormArray;
    const apiEndpointControl = this.jobsForm[jobId].get('api_endpoint') as FormArray;
  
    const collectionId = collectionIdControl.value;
    const query = queryControl.value;
    const apiEndpoint = apiEndpointControl.value;
    
    console.log('Collection ID:', collectionId);
    console.log('Query:', query);
    /* const steps = stepsFormArray.value.map((step: any, index: number) => ({
      id: index + 1, // Assuming id is the index + 1, adjust as needed
      step_type: step.step_type,
      collection_id: step.collection_id,
      //file_category: step.file_category,
      input_files: step.input_files,
      prompt: step.prompt,
      output_format: step.output_format
    })); */

    this.collectionSer.createSteps(this.username, jobId.toString(), collectionId, query, apiEndpoint).subscribe((res: any) => {
      this.jobs[res.data.id] = {
        id: res.data.id,
        job_collection_id: res.data.job_collection_id,
        query: res.data.query,
        order_number: res.data.order_number,
        title: res.data.title,
        html_steps_data: {},
        image_steps_data: {},
        steps: res.data.steps,
        api_endpoint: res.data.api_endpoint,
        dataLoading: false
      };
      this.setSteps(res.data.id, res.data.steps);
    });
  }

  createSteps(jobId: number) {
    console.log('Create steps button clicked');
    if (this.jobsForm[Number(jobId)].get('job_collection_id')?.invalid || this.jobsForm[Number(jobId)].get('query')?.invalid) {
      this.notification.create(
        'warning',
        'Warning',
        'Select a Collection and Enter a Query to create Steps.',
        { nzPlacement: 'top' }
      );
      return;
    }
    const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
    console.log(stepsFormArray)
    if (stepsFormArray.invalid || stepsFormArray.length === 0) {
      this.createStepsInternal(jobId);
    } else {
      this.modal.confirm({
        nzTitle: 'This will delete all Steps and Recreate. Are you sure?',
        nzContent: 'This action cannot be undone.',
        nzOnOk: () => {
          this.createStepsInternal(jobId);
        }
      });
    }
  }

  saveJob(job: any, jobId: number) {
    const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
    stepsFormArray.controls.forEach((control, index) => {
      console.log(`Step ${index + 1} validation status:`, control.valid);
      Object.keys((control as FormGroup).controls).forEach(key => {
        console.log(`Control ${key} validation status:`, control.get(key)?.valid);
      });
    });
    if (stepsFormArray.invalid || stepsFormArray.length === 0) {
      // Mark all controls as touched to show validation errors
      console.log("Invalid form");
      stepsFormArray.markAllAsTouched();
      this.notification.create(
        'warning',
        'Warning',
        'Add Steps and Enter all Values.',
        { nzPlacement: 'top' }
      );
      return;
    }

    this.jobs[Number(jobId)].dataLoading = true;
    const steps = stepsFormArray.value.map((step: any, index: number) => ({
      id: index + 1, // Assuming id is the index + 1, adjust as needed
      step_type: step.step_type,
      file_category: step.file_category,
      //input_files: step.input_files,
      tool_id: step.tool_id,
      prompt: step.prompt,
      output_format: step.output_format,
      selected_file_ids: step.selected_file_ids
    }));
    
    const apiEndpoint = this.jobsForm[jobId].get('api_endpoint')?.value || '';
    const jobCollectionId = this.jobsForm[jobId].get('job_collection_id')?.value || '';
    this.collectionSer.updateJob(this.username, jobId.toString(), JSON.stringify(steps), apiEndpoint, jobCollectionId).subscribe((res: any) => {
      console.log('Job saved', res);
      this.jobs[res.data.id] = {
        id: res.data.id,
        job_collection_id: res.data.job_collection_id,
        query: res.data.query,
        order_number: res.data.order_number,
        title: res.data.title,
        html_steps_data: {},
        image_steps_data: {},
        steps: res.data.steps,
        api_endpoint: res.data.api_endpoint,
        dataLoading: true
      };
      this.collectionSer.getJob(Number(jobId), this.jobInputsMap[jobId]).subscribe(async (res: any) => {
        console.log('Job output: ', res.data);

        const htmlStepsData = await Promise.all(
          Object.entries(res.data.html_steps_data).map(async ([key, value]) => {
            const markedResponse = await marked(value as string);
            return [key, markedResponse];
          })
        );

        this.jobs[Number(jobId)].html_steps_data = Object.fromEntries(htmlStepsData);
        this.jobs[Number(jobId)].image_steps_data = res.data.image_steps_data || {};
        this.jobs[Number(jobId)].query = res.data.query;
        this.jobs[Number(jobId)].job_collection_id = res.data.job_collection_id;
        this.jobs[Number(jobId)].api_endpoint = res.data.api_endpoint;
        this.jobs[Number(jobId)].dataLoading = false;
        //this.dataLoading[newJob.id] = false;
      });
    });
  }

  //edit this function to run only step
  runStep(jobId: number, index: number) {
    /* const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
    const stepControl = stepsFormArray.at(index) as FormGroup;
    if (stepControl.invalid) {
      // Mark the control as touched to show validation errors
      console.log(`Step ${index + 1} is invalid`);
      stepControl.markAllAsTouched();
      this.notification.create(
      'warning',
      'Warning',
      `Step ${index + 1} is invalid. Enter all required values.`,
      { nzPlacement: 'top' }
      );
      return;
    }

    this.jobs[Number(jobId)].dataLoading = true;
    const step = {
      id: index + 1, // Assuming id is the index + 1, adjust as needed
      step_type: stepControl.value.step_type,
      file_category: stepControl.value.file_category,
      //input_files: step.input_files,
      prompt: stepControl.value.prompt,
      output_format: stepControl.value.output_format,
      selected_file_ids: stepControl.value.selected_file_ids
    };
    console.log('Constructed Step:', step); */

    //this.collectionSer.updateStep(this.username, jobId.toString(), JSON.stringify(step)).subscribe((res: any) => {
      
    const stepsFormArray = this.stepsForm[jobId].get('steps') as FormArray;
    stepsFormArray.controls.forEach((control, index) => {
      console.log(`Step ${index + 1} validation status:`, control.valid);
      Object.keys((control as FormGroup).controls).forEach(key => {
        console.log(`Control ${key} validation status:`, control.get(key)?.valid);
      });
    });
    if (stepsFormArray.invalid || stepsFormArray.length === 0) {
      // Mark all controls as touched to show validation errors
      console.log("Invalid form");
      stepsFormArray.markAllAsTouched();
      this.notification.create(
        'warning',
        'Warning',
        'Add Steps and Enter all Values.',
        { nzPlacement: 'top' }
      );
      return;
    }

    this.jobs[Number(jobId)].dataLoading = true;
    const steps = stepsFormArray.value.map((step: any, index: number) => ({
      id: index + 1, // Assuming id is the index + 1, adjust as needed
      step_type: step.step_type,
      file_category: step.file_category,
      //input_files: step.input_files,
      tool_id: step.tool_id,
      prompt: step.prompt,
      output_format: step.output_format,
      selected_file_ids: step.selected_file_ids
    }));
    
    console.log('Constructed Steps:', steps);

    const apiEndpoint = this.jobsForm[jobId].get('api_endpoint')?.value || '';
    const jobCollectionId = this.jobsForm[jobId].get('job_collection_id')?.value || '';
    this.collectionSer.updateJob(this.username, jobId.toString(), JSON.stringify(steps), apiEndpoint, jobCollectionId).subscribe((res: any) => {
    console.log('Job saved', res);
    this.jobs[res.data.id] = {
      id: res.data.id,
      job_collection_id: res.data.job_collection_id,
      query: res.data.query,
      order_number: res.data.order_number,
      title: res.data.title,
      html_steps_data: {},
      image_steps_data: {},
      steps: res.data.steps,
      api_endpoint: res.data.api_endpoint,
      dataLoading: true
    };
    console.log(this.jobInputsMap[jobId]);
    this.collectionSer.getStep(Number(jobId), index+1, this.jobInputsMap[jobId]).subscribe(async (res: any) => {
      console.log('Job output: ', res.data);

      const htmlStepsData = await Promise.all(
        Object.entries(res.data.html_steps_data).map(async ([key, value]) => {
          const markedResponse = await marked(value as string);
          return [key, markedResponse];
        })
      );

      this.jobs[Number(jobId)].html_steps_data = Object.fromEntries(htmlStepsData);
      this.jobs[Number(jobId)].image_steps_data = res.data.image_steps_data || {};
      this.jobs[Number(jobId)].query = res.data.query;
      this.jobs[Number(jobId)].job_collection_id = res.data.job_collection_id;
      this.jobs[Number(jobId)].api_endpoint = res.data.api_endpoint;
      this.jobs[Number(jobId)].dataLoading = false;
        //this.dataLoading[newJob.id] = false;
      });
    });
  }

  deleteJob(jobId: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this job?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.collectionSer.deleteJob(this.username, jobId.toString()).subscribe(() => {
          delete this.jobs[Number(jobId)];
        });
      }
    });
  }

  getStepsFormArray(jobKey: number): FormArray {
    return this.stepsForm[jobKey].get('steps') as FormArray;
  }

  trackByJobKey(index: number, job: any): string {
    return job.key; // Ensure `key` uniquely identifies the job
  }

  decodeHtml(html: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  async copyJobOutput(message: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(message, 'text/html');
    const htmlContent = doc.body.innerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([doc.body.textContent || ''], { type: 'text/plain' })
        })
      ]);
      this.notification.success('Success', 'Text copied to clipboard.', { nzDuration: 2000 });
    } catch (error) {
      this.notification.error('Error', 'Failed to copy text.', { nzDuration: 2000 });
    }
  }

  onJobClick(jobCollectionId: number) {
    //load collectionSelected from allCollections by matching jobCollectionId
    const localStorageData = JSON.parse(localStorage.getItem('allCollections') || '{}');
    this.allCollections = Object.values(localStorageData).flat() as Collection[];

    this.collectionSelected = this.allCollections.find(collection => collection.collection_id === jobCollectionId) || null;
    console.log('Collection Selected: ', this.collectionSelected);
    localStorage.setItem('selectedCollection', JSON.stringify(this.collectionSelected));
    //refresh fileList with selected collection files
    this.fileList = this.collectionSelected?.files || [];
  }

  selectJob(jobKey: number): void {
    this.selectedJobKey = jobKey;

    //load collectionSelected from allCollections by matching jobCollectionId
    const localStorageData = JSON.parse(localStorage.getItem('allCollections') || '{}');
    this.allCollections = Object.values(localStorageData).flat() as Collection[];

    this.collectionSelected = this.allCollections.find(collection => collection.collection_id === this.jobs[jobKey].job_collection_id) || null;
    console.log('Collection Selected: ', this.collectionSelected);
    localStorage.setItem('selectedCollection', JSON.stringify(this.collectionSelected));
    //refresh fileList with selected collection files
    this.fileList = this.collectionSelected?.files || [];
  }

  getSelectedTool(toolId: string): any {
    if (!toolId) {
      // Return a default object with the required properties if tool_id is null/undefined
      return {
        tool_id: '',
        tool_name: 'Default Tool',
        textarea_label: 'Describe the Process to be done on the Input',
        textarea_placeholder: 'What process to do...',
        output_format_flag: true
     };
    }
    // Find the tool by ID and return it
    const found = this.toolList.find(tool => tool.tool_id === toolId);
    
    // If not found, return the default object instead of null
    if (!found) {
      return {
        tool_id: '',
        tool_name: 'Default Tool',
        textarea_label: 'Describe the Process to be done on the Input',
        textarea_placeholder: 'What process to do...',
        output_format_flag: true
      };
    }
    
    return found;
  }
}