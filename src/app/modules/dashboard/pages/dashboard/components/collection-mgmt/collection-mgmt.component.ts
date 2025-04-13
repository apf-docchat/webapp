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
import { DashboardService } from '../../../../service/dashboard.service';
import { UserAuthService } from '../../../../../../common/services/user-auth.service';
import { CollectionService } from '../../../../../../common/services/collection.service';
import { CollectionFileListComponent } from '../../../../../../common/components/collections/collection-file-list/collection-file-list.component';
import { Collection, CurrentScreen, Organization, module } from '../../../../../../common/models/collection.model';
import { ORG_ID, ORG_ROLE } from '../../../../../../common/constants';


@Component({
  selector: 'collection-mgmt',
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
    NzDividerModule,
    NzCollapseModule,
  ],
  templateUrl: './collection-mgmt.component.html',
  styleUrl: './collection-mgmt.component.less'
})
export class CollectionMgmtComponent {
  workingModuleList: string[] = ['newsscraping', 'docguide', 'docchat', 'filewizard', 'askdoc', 'docanalysis']

  organizationList: Organization[] = []
  activeOrg: number | null = 4;
  activeOrgName = '';
  activeOrgRole = 'MEMBER';
  modulesList: module[] = []
  activeModule: number = 1;
  dataLoaded: boolean = false;

  collectionList: Collection[] = []
  collectionSelected: Collection | null = null;
  showCollections: boolean = false;
  allCollectionsForAdmin: Collection[] = []

  userAuthSer = inject(UserAuthService)
  collectionSer = inject(CollectionService)
  dashboardSer = inject(DashboardService)
  drawerSer = inject(NzDrawerService)
  router = inject(Router)

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.collectionList = this.collectionSer.collectionList()
    })
  }
  async ngOnInit() {
    await this.getOrgsList()
    this.activeOrg = this.userAuthSer.getOrgId() ? Number(this.userAuthSer.getOrgId()) : null
    this.dataLoaded=true;
    if (this.activeOrg == null && this.organizationList.length == 1) {
      this.selectOrg(this.organizationList[0].organization_id)
    }
    //if (this.activeOrg) {
      //this.activeOrgName = this.getOrganizationName(this.activeOrg)
      //this.activeOrgRole = this.getOrganizationRole(this.activeOrg)
      this.getCollectionList()
      this.getModuleList()
    //}
    console.log('orgs on ngoninit of dashboard: ', this.organizationList);
    this.cdr.detectChanges();
  }

  async getOrgsList() {
    //this.dashboardSer.getOrgList().subscribe((res: any) => {
    let res = await this.dashboardSer.getOrgList()
    this.organizationList = res.data;
    localStorage.setItem('orgs', JSON.stringify(this.organizationList));
    // if (this.organizationList.length == 1) {
    // this.activeOrg = this.organizationList[0].organization_id
    this.activeOrgName = this.getOrganizationName(this.activeOrg!)
    // this.userAuthSer.setOrgId(this.activeOrg.toString())
    // this.getModuleList()

      // }
    //})
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
      await this.updateCollections();
      //this.cdr.detectChanges();
      window.location.reload();
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
    this.collectionSer.getCollectionsForAdmin().subscribe((res: any) => {
      // this.collectionList = res.data;
      //localStorage.setItem('allCollections', res.data)
      console.log("collection list: ", res.data);
      this.allCollectionsForAdmin = Object.values(res.data).flat() as Collection[];
      console.log("collection for admin list: ", this.allCollectionsForAdmin);
      this.collectionSer.collectionList.set(this.allCollectionsForAdmin);
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

  openComponent(screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean): void {
    let collectionList: Collection[] = [];
    if (collection) {
      // Parse the allCollections object from localStorage
      const allCollections = JSON.parse(localStorage.getItem('allCollections') || '{}');
      
      // allCollections is like {"<org_id>": [{collection1}, {collection2}]}
      // We need to find which org_id contains this collection
      let foundOrgId = null;
      
      // Loop through the object keys (org_ids)
      for (const orgId in allCollections) {
        if (Object.prototype.hasOwnProperty.call(allCollections, orgId)) {
          // Check if the collection exists in this org's array
          const collections = allCollections[orgId];
          const found = collections.some((col: any) => col.collection_id === collection.collection_id);
          
          if (found) {
            foundOrgId = orgId;
            collectionList = allCollections.hasOwnProperty(foundOrgId) ? allCollections[foundOrgId] : [];
            break;
          }
        }
      }
      
      console.log('collectionList:', collectionList);
      
      if (foundOrgId) {
        localStorage.setItem(ORG_ID, foundOrgId);
        localStorage.setItem(ORG_ROLE, 'SUPER_USER');
        this.collectionSer.collectionList.set(collectionList);
        localStorage.setItem('collections', JSON.stringify(collectionList));
        localStorage.setItem('selectedCollection', JSON.stringify(collection) || '');
      }
    }
    const drawerRef = this.drawerSer.create<CollectionFileListComponent, { value: { screen: CurrentScreen, collection: Collection | null, modulesList: module[] | null, isPrivate: boolean } }, string>({
      nzTitle: 'Collection',
      // nzFooter: 'Footer',
      // nzExtra: 'Extra',
      nzContent: CollectionFileListComponent,
      // nzContentParams: {
      //   value: 'asf'
      // },
      nzData: {
        value: { screen: screen, collection: collection ? collection : null, modulesList: modulesList, isPrivate: isPrivate }
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

  selectCollection(collection: Collection) {
    console.log('loading collection');
    this.collectionSelected = collection
    localStorage.setItem('selectedCollection', JSON.stringify(collection) || '');
    let moduleName = this.collectionSelected.module_type
    this.goto(moduleName)
  }

  toggleCollections() {
    this.showCollections = !this.showCollections;
  }
}
