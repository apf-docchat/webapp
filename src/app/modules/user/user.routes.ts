import { Routes } from "@angular/router";
import {
  UserPreferencesPageComponent
} from "./pages/user-preferences/components/user-preferences-page/user-preferences-page.component";

export const routes: Routes = [
  {
    path: 'preferences',
    component: UserPreferencesPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'preferences'
  }
]
