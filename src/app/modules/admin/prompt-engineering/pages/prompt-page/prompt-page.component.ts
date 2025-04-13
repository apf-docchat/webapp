import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../../common/components/header/header.component';
import { FilesComponent } from '../../components/files/files.component';

@Component({
  selector: 'app-prompt-page',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    FilesComponent
  ],
  templateUrl: './prompt-page.component.html',
  styleUrl: './prompt-page.component.less'
})
export class PromptPageComponent {

}
