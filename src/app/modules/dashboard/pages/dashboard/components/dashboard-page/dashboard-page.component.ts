import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { Router, RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";
import { NzIconModule } from "ng-zorro-antd/icon";
import { DashboardAppTileComponent } from "../dashboard-app-tile/dashboard-app-tile.component";
import { UserNavComponent } from "../../../../../../common/components/user-nav/user-nav.component";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NZ_DRAWER_DATA, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DashboardService } from '../../../../service/dashboard.service';
import { UserAuthService } from '../../../../../../common/services/user-auth.service';
import { CollectionService } from '../../../../../../common/services/collection.service';
import { ConfigurationService } from '../../../../../../common/services/configuration.service';
import { CollectionFileListComponent } from '../../../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { Collection, CurrentScreen, Organization, module } from '../../../../../../common/models/collection.model';
import { ORG_ID, ORG_ROLE } from '../../../../../../common/constants';
import { JobsPageComponent } from "../../../../../chat/pages/jobs-page/jobs-page.component";
import { CollectionMgmtComponent } from '../../../dashboard/components/collection-mgmt/collection-mgmt.component';



@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    RouterLink,
    NgOptimizedImage,
    NzIconModule,
    NzDrawerModule,
    NzTabsModule,
    DashboardAppTileComponent,
    UserNavComponent,
    NzGridModule,
    NzEmptyModule,
    NzDividerModule,
    NzCollapseModule,
    NzBadgeModule,
    NzCardModule,
    NzAvatarModule,
    NzModalModule,
    JobsPageComponent,
    CollectionMgmtComponent
],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.less'
})
export class DashboardPageComponent {
  logoUrl = ''
  workingModuleList: string[] = ['newsscraping', 'docguide', 'docchat', 'filewizard', 'askdoc', 'docanalysis']

  organizationList: Organization[] = []
  activeOrg: number | null = 0;
  activeOrgName = '';
  activeOrgRole = 'MEMBER';
  modulesList: module[] = []
  activeModule: number = 1;
  dataLoaded: boolean = false;

  allCollectionList: { [orgId: number]: Collection[] } = {}
  selectedOrgCollectionList: Collection[] = []
  collectionSelected: Collection | null = null;
  showCollections: boolean = false;

  userAuthSer = inject(UserAuthService)
  collectionSer = inject(CollectionService)
  dashboardSer = inject(DashboardService)
  drawerSer = inject(NzDrawerService)
  router = inject(Router)

  constructor(
    private cdr: ChangeDetectorRef,
    private configService: ConfigurationService,
  ) {
    effect(() => {
      this.selectedOrgCollectionList = this.collectionSer.collectionList()
    })
  }
  ngOnInit() {
    localStorage.removeItem('selectedCollection');
    localStorage.removeItem('collections');
    localStorage.removeItem(ORG_ID);
    localStorage.removeItem(ORG_ROLE);
    this.configService.loadConfig().subscribe(() => {
      this.logoUrl = this.configService.getLogoUrl();
    });

    this.getOrgsList();
  }

  getOrgsList() {
    this.dashboardSer.getOrgList().then((res: any) => {
      this.organizationList = res.data || [];
      localStorage.setItem('orgs', JSON.stringify(this.organizationList));
      this.getCollectionList();

      this.activeOrg = this.userAuthSer.getOrgId() ? Number(this.userAuthSer.getOrgId()) : null;
      this.dataLoaded = true;

      if (this.activeOrg == null && this.organizationList && this.organizationList.length === 1) {
        this.selectOrg(this.organizationList[0].organization_id);
      }

      if (this.activeOrg) {
        this.activeOrgName = this.getOrganizationName(this.activeOrg);
        this.activeOrgRole = this.getOrganizationRole(this.activeOrg);
      }
      this.getModuleList();

      this.cdr.detectChanges();
    }).catch((error: any) => {
      console.error('Error fetching organization list:', error);
    });
  }

  getModuleList() {
    this.dashboardSer.getModuleList().subscribe((res: any) => {
      this.modulesList = res.data
      this.activeModule = this.modulesList[0].module_id
    })
  }

  getChatList() {
    this.dashboardSer.getChatList().subscribe((res: any) => {
      this.organizationList = res.data
    })
  }

  async selectOrg(orgId: number) {
    this.dataLoaded = false;
    if (this.activeOrg !== orgId) {
      this.activeOrg = orgId
      this.activeOrgName = this.getOrganizationName(this.activeOrg)
      this.activeOrgRole = this.getOrganizationRole(this.activeOrg)
      this.userAuthSer.setOrgId(this.activeOrg.toString())
      this.userAuthSer.setOrgRole(this.activeOrgRole)
      this.getModuleList()
      this.getCollectionList()
      //await this.updateCollections();
      //this.cdr.detectChanges();
      //window.location.reload();
    }
  }

    updateCollections():Promise<Collection[]> {
      return new Promise((resolve, reject) => {
        this.collectionSer.getUploadedFileList().subscribe((res: any) => {
          this.collectionSer.collectionList.set(res.data)
          localStorage.setItem('collections', JSON.stringify(res.data));
          resolve(JSON.parse(localStorage.getItem('collections') || '[]'));
        })
      })
    }

  selectModule(moduleId: number) {
    this.activeModule = moduleId
  }

  getOrganizationName(orgId: number): string {
    const organization = this.organizationList.find(org => org.organization_id === orgId);
    return organization ? organization.organization_name : 'Org'; // Or provide a default value
  }

  getOrganizationRole(orgId: number): string {
    const organization = this.organizationList.find(org => org.organization_id === orgId);
    return organization ? organization.role : 'MEMBER';
  }

  backToOrgSelection() {
    this.activeOrg = null
    this.userAuthSer.removeOrgId()
    this.modulesList = []
  }

  getCollectionList() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      // this.collectionList = res.data;
      let collectionList: Collection[] = [];
      
      if (Array.isArray(res.data)) {
        collectionList = res.data;
        localStorage.setItem('collections', JSON.stringify(res.data));
      } else {
        collectionList = (this.activeOrg === 0 || this.activeOrg === null)? [] : res.data[this.activeOrg] || [];
        localStorage.setItem('collections', JSON.stringify(collectionList));
        localStorage.setItem('allCollections', JSON.stringify(res.data));
        this.allCollectionList = res.data;
      }
      this.collectionSer.collectionList.set(collectionList);
    })
  }

  goto(moduleType: string) {
    if (moduleType === 'docguide') {
      this.router.navigate(['/ra'])
    } else if (moduleType === 'newsscraping') {
      this.router.navigate(['/newsScraping'])
    }
    else if (moduleType === 'docchat') {
      this.router.navigate(['/docchat'])
    }
    else if (moduleType === 'askdoc') {
      this.router.navigate(['/docInsight'])
    }
    else if (moduleType === 'docanalysis') {
      this.router.navigate(['/docAnalysis'])
    }
    else if (moduleType === 'filewizard') {
      this.router.navigate(['/fileProcessor'])
    }
    else if (moduleType === 'chat') {
      this.router.navigate(['/chat'])
    }
  }

  openComponent(screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean, orgChosen: boolean, orgId: number | null = null): void {
    if (orgId != null) {
      localStorage.setItem(ORG_ID, orgId.toString());
    }
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean, orgChosen: boolean } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: screen, collection: collection ? collection : null, modulesList: modulesList, isPrivate: isPrivate, orgChosen: orgChosen }
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      // console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      if (typeof data === 'string') {
        // this.value = data;
      }
    });
  }

  selectCollection(orgId: number, collection: Collection) {
    console.log('loading collection');
    this.selectOrg(orgId);
    this.collectionSelected = collection
    localStorage.setItem('selectedCollection', JSON.stringify(collection) || '');
    let moduleName = this.collectionSelected.module_type
    this.goto(moduleName)
  }

  toggleCollections() {
    this.showCollections = !this.showCollections;
  }

  get orgIds(): number[] {
    return Object.keys(this.allCollectionList).map(Number); // Makes all coll list iterable
  }
  
}
