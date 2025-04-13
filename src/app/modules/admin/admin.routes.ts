import { Routes } from "@angular/router";
import {AdminFunctionsComponent} from "./pages/admin-functions/admin-functions.component";

export const routes: Routes = [
  {
    path: 'functions',
    component: AdminFunctionsComponent,
  },
  {
  path: 'promptEngineering',
  loadChildren: () => import('./prompt-engineering/prompt.routes').then(m => m.routes),
  },
]
