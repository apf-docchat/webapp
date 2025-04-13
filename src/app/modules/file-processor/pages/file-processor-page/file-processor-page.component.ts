import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../common/components/header/header.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-file-processor-page',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  templateUrl: './file-processor-page.component.html',
  styleUrl: './file-processor-page.component.less'
})
export class FileProcessorPageComponent {

  constructor(private router: Router) {}

  navigateTo(moduleName: string) {
    if (moduleName === 'DocChat') {
      this.router.navigate(['/fileProcessor/docChat-settings'])
    }
    if (moduleName === 'DocGuide') {
      this.router.navigate(['/fileProcessor/docGuide-settings'])
    }
  }
}
