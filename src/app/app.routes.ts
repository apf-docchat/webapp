import { Routes } from '@angular/router';
import { PageNotFoundComponent } from "./common/components/page-not-found/page-not-found.component";
import { authGuard } from './common/guard/auth.guard';
import { notSignedInGuard } from './common/guard/not-signed-in.guard';


export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.routes),
    canActivate: [notSignedInGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./modules/user/user.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: true,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.routes').then(m => m.routes),
    data: {
      attributes: {
        hasNavbar: true,
      }
    }, canActivate: [authGuard]
  },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./modules/admin/admin.routes').then(m => m.routes),
  //   data: {
  //     attributes: {
  //       hasUserNav: true,
  //       hasSidebar: true,
  //     }
  //   }, canActivate: [authGuard]
  // },
  {
    path: 'docchat',
    loadChildren: () => import('./modules/docchat/docchat.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'ra',
    loadChildren: () => import('./modules/ra/ra.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'fileProcessor',
    loadChildren: () => import('./modules/file-processor/file-processor.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'newsScraping',
    loadChildren: () => import('./modules/news-scraping/news-scraping.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'docInsight',
    loadChildren: () => import('./modules/docInsight/docInsight.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'docAnalysis',
    loadChildren: () => import('./modules/docAnalysis/docAnalysis.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./modules/chat/chat.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.routes),
    data: {
      attributes: {
        hasUserNav: true,
        hasSidebar: false,
      }
    }, canActivate: [authGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
