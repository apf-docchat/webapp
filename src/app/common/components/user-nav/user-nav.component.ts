import { Component, inject, model, ChangeDetectorRef, HostListener } from '@angular/core';
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzIconModule } from "ng-zorro-antd/icon";
import { Router, RouterLink } from "@angular/router";
import { UserAuthService } from '../../services/user-auth.service';
import { CollectionService } from '../../services/collection.service';
import { Organization, Collection } from '../../../common/models/collection.model';
import { DashboardService } from '../../../modules/dashboard/service/dashboard.service';
import { FNC_SEE, ORG_ID, ORG_ROLE } from '../../constants';

@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [
    NzDropDownModule,
    NzAvatarModule,
    NzIconModule,
    RouterLink
  ],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.less'
})
export class UserNavComponent {
  organizations: Organization[] = [];
  currentOrganization: number = 0;
  //collections: Collection[] = [];
  //collectionSelected: Collection | null = null;
  allCollectionList: { [orgId: number]: Collection[] } = {}
  selectedOrgCollectionList: Collection[] = []
  collectionSelected: Collection | null = null;  
  router = inject(Router)
  collectionSer = inject(CollectionService)
  dashboardSer = inject(DashboardService)
  fncSee = false;

  previousValue = 0;
  innerWidth!: number;

  constructor(
    private userAuthSer: UserAuthService,
    private cdr: ChangeDetectorRef
  ) {

  }

  async ngOnInit() {
    console.log('allCollectionList: ', this.allCollectionList);
    this.allCollectionList = JSON.parse(localStorage.getItem('allCollections') || '{}');
    this.innerWidth = window.innerWidth;
    this.previousValue = this.innerWidth
    //this.organizations = JSON.parse(localStorage.getItem('orgs') || '[]');
    await this.getOrgsList();
    this.fncSee = (localStorage.getItem(FNC_SEE) || '0') === '0' ? false: true;
    this.getCollectionList()

    let role = this.organizations.find(x => x.organization_id === this.currentOrganization)?.role;
    //this.userAuthSer.setOrgId(this.currentOrganization.toString())
    this.userAuthSer.setOrgRole(role || 'MEMBER')
    
    //this.updateCollections();
    //refresh angular frontend components
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (event.target instanceof Window) {
      this.innerWidth = event.target.innerWidth;
    }
  }



  async getOrgsList() {
    let res = await this.dashboardSer.getOrgList()
    this.organizations = res.data;
    localStorage.setItem('orgs', JSON.stringify(this.organizations));  
    this.currentOrganization = Number(localStorage.getItem('orgId')) || 0;
    this.selectedOrgCollectionList = JSON.parse(localStorage.getItem('collections') || '[]');
    this.collectionSelected = JSON.parse(localStorage.getItem('selectedCollection') || 'null');
  }

  async changeOrganization(org: any) {
    this.currentOrganization = org.organization_id;
    //localStorage.setItem('orgId', org.organization_id);
    //find the organizations element which has the same organization_id as this.currentOrganization and get the role of that element
    let role = this.organizations.find(x => x.organization_id === this.currentOrganization)?.role;
    //localStorage.setItem('orgRole', role || 'MEMBER');
    localStorage.removeItem('selectedCollection');
    //localStorage.removeItem('collectionId');
    console.log('Organization changed to:', org.organization_name);
    //this.router.navigate(['/dashboard'])

    this.userAuthSer.setOrgId(this.currentOrganization.toString())
    this.userAuthSer.setOrgRole(role || 'MEMBER')
    this.getCollectionList()
    //this.selectedOrgCollectionList = await this.updateCollections(); //JSON.parse(localStorage.getItem('collections') || '[]');
    //this.cdr.detectChanges();
    //window.location.reload();
  }

  updateCollections(): Promise<Collection[]> {
    return new Promise((resolve, reject) => {
      this.collectionSer.getUploadedFileList().subscribe((res: any) => {
        this.collectionSer.collectionList.set(res.data)
        localStorage.setItem('collections', JSON.stringify(res.data));
        resolve(JSON.parse(localStorage.getItem('collections') || '[]'));
      })
    })
  }

  getCollectionList() {
    this.collectionSer.getUploadedFileList().subscribe((res: any) => {
      console.log('Collection List:', res.data);
      // this.collectionList = res.data;
      let collectionList: Collection[] = [];
      
      if (Array.isArray(res.data)) {
        collectionList = res.data;
        localStorage.setItem('collections', JSON.stringify(res.data));
      } else {
        this.allCollectionList = res.data;
        collectionList = this.currentOrganization === 0 ? [] : res.data[this.currentOrganization] || [];
        localStorage.setItem('collections', JSON.stringify(collectionList));
        localStorage.setItem('allCollections', JSON.stringify(res.data));
        this.cdr.detectChanges();
      }
      this.collectionSer.collectionList.set(collectionList);
      this.selectedOrgCollectionList = collectionList; //JSON.parse(localStorage.getItem('collections') || '[]');
    })
  }
  changeCollection(org: Organization, collection: any): void {
    this.changeOrganization(org);
    this.collectionSelected = collection;
    localStorage.setItem('selectedCollection', JSON.stringify(collection) || '');
    //localStorage.setItem('collectionId', collection.collection_id);
    console.log('Collection changed to:', collection.collection_name);
    //this.router.navigate(['/dashboard'])
    //this.cdr.detectChanges();
    //window.location.reload();
    let moduleName = this.collectionSelected?.module_type || 'docchat';
    //this.goto(moduleName)
    //this.cdr.detectChanges();

    let moduleType = this.collectionSelected?.module_type;
    if (moduleType) {
      this.goto(moduleType);
    }
    //window.location.reload();
  }

  goto(moduleType: string) {
    const currentRoute = this.router.url;

    if (moduleType === 'docguide' && currentRoute !== '/ra') {
      this.router.navigate(['/ra']);
    } else if (moduleType === 'newsscraping' && currentRoute !== '/newsScraping') {
      this.router.navigate(['/newsScraping']);
    } else if (moduleType === 'docchat' && currentRoute !== '/docchat') {
      this.router.navigate(['/docchat']);
    } else if (moduleType === 'askdoc' && currentRoute !== '/docInsight') {
      this.router.navigate(['/docInsight']);
    } else if (moduleType === 'docanalysis' && currentRoute !== '/docAnalysis') {
      this.router.navigate(['/docAnalysis']);
    } else if (moduleType === 'filewizard' && currentRoute !== '/fileProcessor') {
      this.router.navigate(['/fileProcessor']);
    } else if (moduleType === 'chat' && currentRoute !== '/chat') {
      this.router.navigate(['/chat']);
    } else {
      window.location.reload();
    }
  }

  userMenuNavigate(slug: string) {
    if (slug === 'dashboard') {
      localStorage.removeItem('selectedCollection');
      localStorage.removeItem('collections');
      localStorage.removeItem(ORG_ID);
      localStorage.removeItem(ORG_ROLE);
      this.router.navigate(['/' + slug]);
    } else if (slug === 'admin') {
      this.router.navigate(['/admin/functions']);
    }
    else {
      this.router.navigate(['/' + slug]);
    }
  }

  trackByCollectionId(collection: any): number {
    return collection.collection_id;
  }

  get orgIds(): number[] {
    return Object.keys(this.allCollectionList).map(Number); // Makes all coll list iterable
  }

  logout() {
    this.userAuthSer.logoutUser();
  }

}
