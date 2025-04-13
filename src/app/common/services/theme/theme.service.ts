import { inject, Injectable } from '@angular/core';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { themeConfig } from '../../models/theme-config.model';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private nzConfigService: NzConfigService = inject(NzConfigService);
  constructor() {}

  changeTheme(theme?: themeConfig) {
    if (!theme) {
      const themeConfig = localStorage.getItem('theme');
      if (themeConfig) {
        theme = JSON.parse(themeConfig);
      } else {
        theme = {
          nzPrimaryColor: '#1463db',
          backgroundColor1: '#878ac255',
          backgroundColor2: '#878ac2',
          folderIconColor: '#1463db',
          highlightBackgroundColor: '#b5cef3'
        }
      }
    } else {
      localStorage.setItem('theme', JSON.stringify(theme));
    }

    this.nzConfigService.set('theme', {
      'primaryColor': theme!.nzPrimaryColor, // Change primary color
    });

    document.documentElement.style.setProperty('--background-color1', theme!.backgroundColor1);
    document.documentElement.style.setProperty('--background-color2', theme!.backgroundColor2);
    document.documentElement.style.setProperty('--folder-icon-color', theme!.folderIconColor);
    document.documentElement.style.setProperty('--highlight-background-color', theme!.highlightBackgroundColor);
  }


}
