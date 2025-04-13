import { Component, inject } from '@angular/core';
import { UserAuthService } from '../../services/user-auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserNavComponent } from '../user-nav/user-nav.component';
import { ORG_ID, ORG_ROLE } from '../../constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NzLayoutModule,
    NzMenuModule,
    UserNavComponent,
    NzIconModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less'
})
export class HeaderComponent {

  logoUrl = '';
  userAuthSer = inject(UserAuthService);
  title = ''
  selectedCollectionName = ''

  showBackButton = false;

  constructor(
    private router: Router,
    private configService: ConfigurationService,
  ) {
    this.logoUrl = this.configService.getLogoUrl();
    this.router.events.subscribe(event => {
      let selectedCollection = localStorage.getItem('selectedCollection') || ''
      if (selectedCollection != '') {
        this.selectedCollectionName = JSON.parse(selectedCollection)['collection_name']
      }
      if (event instanceof NavigationEnd) {
        this.updateTitleBasedOnUrl();
      }
    });
  }

  updateTitleBasedOnUrl() {
    const currentUrl = this.router.url;
    // Assuming the URL ending contains the title
    // For example, if URL ends with '/dashboard', the title will be 'Dashboard'
    const parts = currentUrl.split('/');
    const ending = parts[parts.length - 1];

    if (ending === 'newsScraping') {
      this.title = 'Workplace Safety';
      this.showBackButton = true
    } else if (ending === 'ra') {
      //this.title = 'DocGuide';
      this.title = this.selectedCollectionName;
      this.showBackButton = true
    } else if (ending === 'docchat') {
      //this.title = 'DocChat-Grants';
      this.title = this.selectedCollectionName;
      this.showBackButton = true
    } else if (ending === 'docInsight') {
      //this.title = 'DocChat';
      this.title = this.selectedCollectionName;
      this.showBackButton = true
    } else if (ending === 'docAnalysis') {
      //this.title = 'Doc Analysis';
      this.title = this.selectedCollectionName;
      this.showBackButton = true
    } else if (ending === 'fileProcessor') {
      this.title = 'File Processor';
      this.showBackButton = true
    }
    else if (ending === 'docChat-settings' || ending === 'docGuide-settings') {
      this.title = 'File Processor';
      this.showBackButton = true;
    } else if (ending === 'promptEngineering') {
      this.title = 'Prompt Engineering';
      this.showBackButton = true
    } else {
      this.showBackButton = false
    }

  }

  homeNavigate() {
      localStorage.removeItem('selectedCollection');
      localStorage.removeItem('collections');
      localStorage.removeItem(ORG_ID);
      localStorage.removeItem(ORG_ROLE);
      this.router.navigate(['/dashboard']);
  }

  logout() {
    this.userAuthSer.logoutUser();
  }
}
