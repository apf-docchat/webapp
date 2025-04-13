import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    FormsModule,
    NzDividerModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzCollapseModule,
    NzInputModule,
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.less'
})
export class FilesComponent {

  panels = [
    {
      active: true,
      name: 'docchat_prompts.json',
      disabled: false,
      customStyle: {
        background: '#f7f7f7',
        'border-radius': '4px',
        'margin-bottom': '10px',
        border: '0px'
      }
    }
  ];

  textdata = `Categorise the type of question the User is asking based on the below and respond with the category number:
  1. search type of query - eg: Which district in kalyana karnataka has the most number of creches?
  2. single doc, but needs whole doc to answer - eg: list all sections of karur proposal, summarise the creche proposal
  3. multi doc, whole doc types - eg: give a list of the types of proposals received
  4. structured data type query - eg: give a piechart of the languages spoken by the students`
}
