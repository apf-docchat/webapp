import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { CollectionService } from '../../../services/collection.service';
import { Collection, module, Organization} from '../../../models/collection.model';


@Component({
  selector: 'app-set-collection-name',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDividerModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzNotificationModule,
    NzTagModule,
    ReactiveFormsModule
  ],
  templateUrl: './set-collection-name.component.html',
  styleUrl: './set-collection-name.component.less'
})
export class SetCollectionNameComponent {

  collectionForm!: FormGroup;
  @Input() collection: Collection | undefined;
  @Input() modulesList: module[] | undefined;
  @Input() isPrivate: boolean | undefined;
  @Input() orgChosen: boolean | undefined;
  @Output() returnValue = new EventEmitter<{ success: boolean, collectionName: string}>();
  // collectionName: string = '';

  orgs: Organization[] = [];
  types: any[] = ['file', 'db', 'file-db', 'googlesheet'];

  constructor(
    private fb: FormBuilder,
    private collectionSer: CollectionService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.orgs = localStorage.getItem('orgs') ? JSON.parse(localStorage.getItem('orgs') || '') : [];
    this.setUpForm()
  }

  setUpForm() {
    this.collectionForm = this.fb.group({
      name: [this.collection ? this.collection?.collection_name : '', Validators.required],
      description: [this.collection ? this.collection?.description ? this.collection?.description : '' : '', Validators.required],
      module_id: [10, [Validators.required, this.moduleTypeValidator.bind(this)]],
      org_id: [0, [Validators.required, this.orgTypeValidator.bind(this)]],
      type: ['file', [Validators.required, this.typeTypeValidator.bind(this)]],
      db_uri: [''],
      googlesheet_url: [''],
      is_private: [this.isPrivate]
    });

    // Set up a listener for type changes to update validators
    this.collectionForm.get('type')?.valueChanges.subscribe(type => {
      // Reset validation for db_uri and googlesheet_url
      const dbUriControl = this.collectionForm.get('db_uri');
      const googlesheetUrlControl = this.collectionForm.get('googlesheet_url');
      
      // Clear validators first
      dbUriControl?.clearValidators();
      googlesheetUrlControl?.clearValidators();
      
      // Apply appropriate validators based on type
      if (type === 'db' || type === 'file-db') {
        dbUriControl?.setValidators([Validators.required]);
      }
      
      if (type === 'googlesheet') {
        googlesheetUrlControl?.setValidators([Validators.required]);
      }
      
      // Update validity
      dbUriControl?.updateValueAndValidity();
      googlesheetUrlControl?.updateValueAndValidity();
    });
  }

  moduleTypeValidator(control: AbstractControl): ValidationErrors | null {
    const valid = this.modulesList?.some(module => module.module_id === control.value);
    return valid ? null : { invalidModuleType: true };
  }

  orgTypeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    }
    return null;
  }
  
  dbUriTypeValidator(control: AbstractControl): ValidationErrors | null {
    const type = this.collectionForm?.get('type')?.value;
    
    // DB URI is required only for db and file-db types
    if ((type === 'db' || type === 'file-db') && !control.value) {
      return { required: true };
    }
    
    return null;
  }

  googlesheetUrlValidator(control: AbstractControl): ValidationErrors | null {
    const type = this.collectionForm?.get('type')?.value;
    
    // Googlesheet URL is required only for googlesheet type
    if (type === 'googlesheet' && !control.value) {
      return { required: true };
    }
    
    return null;
  }

  typeTypeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    }
    return null;
  }
  get name() {
    return this.collectionForm.get('name');
  }
  get description() {
    return this.collectionForm.get('description');
  }
  get module_id() {
    return this.collectionForm.get('module_id');
  }
  get org_id() {
    return this.collectionForm.get('org_id');
  }
  get type() {
    return this.collectionForm.get('type');
  }
  get db_uri() {
    return this.collectionForm.get('db_uri');
  }
  get googlesheet_url() {
    return this.collectionForm.get('googlesheet_url');
  }
  get is_private() {
    return this.collectionForm.get('is_private');
  }

  backToScreen(value: boolean, collectionName: string) {
    console.log(this.collectionForm.get('name'))
    this.returnValue.emit({ success: value, collectionName: collectionName });
  }

  submit() {
    if (this.collectionForm.invalid) {
      this.collectionForm.markAllAsTouched();
      return;
    } else {
      if (this.collection) {
        // Edit Collection
        this.collectionSer.editCollection(this.collectionForm.value, this.collection.collection_id).subscribe({
          next: (res: any) => {
            this.notification.create(
              'success',
              'Success',
              res.message,
              { nzPlacement: 'bottomLeft' }
            );
            let collectionName = this.collectionForm.get('name')?.value;
            this.backToScreen(true, collectionName);
          },
          error: (error: any) => {
            // Handle the error response from the backend
            const errorMessage = error.error?.message || 'An error occurred while updating the collection';
            this.notification.create(
              'error',
              'Error',
              errorMessage,
              { nzPlacement: 'bottomLeft' }
            );
            // Don't navigate away on error
            // Optionally log the full error for debugging
            console.error('Edit collection error:', error);
          }
        });
      } else {
        // Add Collection
        this.collectionSer.addCollection(this.collectionForm.value).subscribe({
          next: (res: any) => {
            this.notification.create(
              'success',
              'Success',
              res.message,
              { nzPlacement: 'bottomLeft' }
            );
            let collectionName = this.collectionForm.get('name')?.value;
            this.backToScreen(true, collectionName);
          },
          error: (error: any) => {
            // Handle the error response from the backend
            const errorMessage = error.error?.message || 'An error occurred while adding the collection';
            this.notification.create(
              'error',
              'Error',
              errorMessage,
              { nzPlacement: 'bottomLeft' }
            );
            // Don't navigate away on error
            // Optionally log the full error for debugging
            console.error('Add collection error:', error);
          }
        });
      }
    }
  }

}
