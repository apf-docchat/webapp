import { Routes } from "@angular/router";
import { LoginPageComponent } from "./pages/login/components/login-page/login-page.component";
import {
  PasswordResetPageComponent
} from "./pages/password-reset/components/password-reset-page/password-reset-page.component";
import {
  PasswordResetVerificationPageComponent
} from "./pages/password-reset-verification/components/password-reset-verification-page/password-reset-verification-page.component";
import { MsauthComponent } from "./pages/msauth/msauth.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'password-reset',
    component: PasswordResetPageComponent,
  },
  {
    path: 'password-reset/verify',
    component: PasswordResetVerificationPageComponent,
  },
  {
    path: 'msauth',
    component: MsauthComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
]
