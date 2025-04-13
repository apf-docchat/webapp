import { Injectable } from '@angular/core';
import { ACCESS_TOKEN, ORG_ID, ORG_ROLE, USERNAME, FNC_SEE } from '../constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  constructor(private router: Router) {}

  setUserToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN, token)
  }

  setUsername(username: string) {
    localStorage.setItem(USERNAME, username)
  }

  setUserAdminStatus(sysadmin: string) {
    localStorage.setItem(FNC_SEE, sysadmin)
  }

  getUserToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN) ? localStorage.getItem(ACCESS_TOKEN) : null
  }

  setOrgId(org_id: string) {
    localStorage.setItem(ORG_ID, org_id)
  }

  getOrgId(): string | null {
    return localStorage.getItem(ORG_ID) ? localStorage.getItem(ORG_ID) : null
  }
  removeOrgId(): void {
    localStorage.removeItem(ORG_ID)
  }

  setOrgRole(role: string) {
    localStorage.setItem(ORG_ROLE, role)
  }

  getOrgRole(): string {
    let orgRole = localStorage.getItem(ORG_ROLE)
    if (orgRole == null) {
      orgRole = 'MEMBER'
    }
    return orgRole
  }

  removeOrgRole(): void {
    localStorage.removeItem(ORG_ROLE)
  }


  logoutUser() {
    let themeConfig = localStorage.getItem('theme');

    localStorage.clear()
    if (themeConfig) {
      localStorage.setItem('theme', themeConfig);
    }
    this.router.navigate(['auth'])
  }
}
