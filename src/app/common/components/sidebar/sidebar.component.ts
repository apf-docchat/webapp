import { Component, inject } from '@angular/core';
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzIconModule } from "ng-zorro-antd/icon";
import { RouterLink } from "@angular/router";
import { SidebarStatusService } from "./sidebar-status.service";
import { Observable } from "rxjs";
import { SidebarStatus } from "./sidebar-status.types";
import { AsyncPipe } from "@angular/common";
import { NzNoAnimationModule } from "ng-zorro-antd/core/no-animation";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    RouterLink,
    AsyncPipe,
    NzNoAnimationModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.less'
})
export class SidebarComponent {
  private sidebarStatusService = inject(SidebarStatusService);

  sidebarStatus$!: Observable<SidebarStatus>;

  ngOnInit(): void {
    this.sidebarStatus$ = this.sidebarStatusService.status;
  }

  onCollapsedChange($event: boolean): void {
    this.sidebarStatusService.collapsed = $event;
  }
}
