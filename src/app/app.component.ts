import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable } from "rxjs";
import { PageAttributesService } from "./common/services/page-attributes/page-attributes.service";
import { PageAttributes } from "./common/services/page-attributes/page-attributes.types";
import { SidebarComponent } from "./common/components/sidebar/sidebar.component";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SidebarStatusService } from "./common/components/sidebar/sidebar-status.service";
import { SidebarStatus } from "./common/components/sidebar/sidebar-status.types";
import { UserNavComponent } from "./common/components/user-nav/user-nav.component";
import { LoadingSpinnerService } from './common/services/loading-spinner.service';
import { ThemeService } from './common/services/theme/theme.service';
import { themeConfig } from './common/models/theme-config.model';
import { ConfigurationService } from './common/services/configuration.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NzLayoutModule, UserNavComponent, NzSpinModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  private loadingSpinnerSer = inject(LoadingSpinnerService)
  private pageAttributesService = inject(PageAttributesService);
  private sidebarStatusService = inject(SidebarStatusService);
  private themeSer = inject(ThemeService);
  private configService = inject(ConfigurationService);

  pageAttributes$!: Observable<PageAttributes>;
  sidebarStatus$!: Observable<SidebarStatus>;

  isLoading: boolean = false;
  constructor() {
    effect(() => {
      this.isLoading = this.loadingSpinnerSer.showSpinner()
    })
  }

  ngOnInit() {
    this.pageAttributes$ = this.pageAttributesService.pageAttributes;

    this.sidebarStatus$ = this.sidebarStatusService.status;

    this.themeSer.changeTheme();

    this.configService.loadConfig().subscribe(() => {
      const themeConfig = this.configService.getThemeConfig();
      this.themeSer.changeTheme(themeConfig);
    });
  }

  changeTheme() {
    /* let themeConfig: themeConfig = {
      nzPrimaryColor: '#db1414',
      backgroundColor1: '#c2878755',
      backgroundColor2: '#c28787',
      folderIconColor: '#db1414',
      highlightBackgroundColor: '#dc9898'
    } */
    const themeConfig = this.configService.getThemeConfig();
    this.themeSer.changeTheme(themeConfig);
  }
}
