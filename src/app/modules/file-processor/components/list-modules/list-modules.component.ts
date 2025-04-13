import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-list-modules',
  standalone: true,
  imports: [NzDividerModule, NzEmptyModule, NzIconModule],
  templateUrl: './list-modules.component.html',
  styleUrl: './list-modules.component.less'
})
export class ListModulesComponent {
  modulesList: string[] = [
    'DocChat', 'DocGuide',
  ]

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  navigateTo(moduleName: string) {
    if (moduleName === 'DocChat') {
      this.router.navigate(['/fileProcessor/docChat-settings'])
    }
    if (moduleName === 'DocGuide') {
      this.router.navigate(['/fileProcessor/docGuide-settings'])
    }
  }
}
