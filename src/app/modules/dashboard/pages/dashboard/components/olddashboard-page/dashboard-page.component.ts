import { Component, effect, inject } from '@angular/core';
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
import { NZ_DRAWER_DATA, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { DashboardService } from '../../../../service/dashboard.service';
import { UserAuthService } from '../../../../../../common/services/user-auth.service';
import { CollectionService } from '../../../../../../common/services/collection.service';
import { CollectionFileListComponent } from '../../../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { Collection, CurrentScreen } from '../../../../../../common/models/collection.model';
type Organization = {
  "organization_id": number,
  "organization_name": string
}
type module = {
  "module_description": string,
  "module_id": number,
  "module_name": string,
  "module_type": string
}

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
    DashboardAppTileComponent,
    UserNavComponent,
    NzGridModule,
    NzEmptyModule,
    NzDividerModule
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.less'
})
export class OldDashboardPageComponent {
  workingModuleList: string[] = ['newsscraping', 'docguide', 'docchat', 'filewizard', 'askdoc', 'docanalysis']

  organizationList: Organization[] = []
  activeOrg: number | null = 4;
  activeOrgName = '';
  modulesList: module[] = []
  activeModule: number = 1;

  collectionList: Collection[] = []

  userAuthSer = inject(UserAuthService)
  collectionSer = inject(CollectionService)
  dashboardSer = inject(DashboardService)
  drawerSer = inject(NzDrawerService)
  router = inject(Router)

  constructor() {
    effect(() => {
      this.collectionList = this.collectionSer.collectionList()
    })
  }
  ngOnInit() {

    this.getOrgsList()
    this.activeOrg = this.userAuthSer.getOrgId() ? Number(this.userAuthSer.getOrgId()) : null
    if (this.activeOrg) {
      this.activeOrgName = this.getOrganizationName(this.activeOrg)
      this.getCollectionList()
      this.getModuleList()
    }
  }

  getOrgsList() {
    this.dashboardSer.getOrgList().subscribe((res: any) => {
      this.organizationList = res.data;
      // if (this.organizationList.length == 1) {
      // this.activeOrg = this.organizationList[0].organization_id
      this.activeOrgName = this.getOrganizationName(this.activeOrg!)
      // this.userAuthSer.setOrgId(this.activeOrg.toString())
      // this.getModuleList()

      // }
    })
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

  selectOrg(orgId: number) {
    if (this.activeOrg !== orgId) {
      this.activeOrg = orgId
      this.activeOrgName = this.getOrganizationName(this.activeOrg)
      this.userAuthSer.setOrgId(this.activeOrg.toString())
      this.getModuleList()
      this.getCollectionList()
    }
  }

  selectModule(moduleId: number) {
    this.activeModule = moduleId
  }

  getOrganizationName(orgId: number): string {
    const organization = this.organizationList.find(org => org.organization_id === orgId);
    return organization ? organization.organization_name : 'Org'; // Or provide a default value
  }

  backToOrgSelection() {
    this.activeOrg = null
    this.userAuthSer.removeOrgId()
    this.modulesList = []
  }

  getCollectionList() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      // this.collectionList = res.data;
      this.collectionSer.collectionList.set(res.data)
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
  }

  openComponent(screen: CurrentScreen, collection: Collection | null): void {
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: screen, collection: collection ? collection : null }
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
}
