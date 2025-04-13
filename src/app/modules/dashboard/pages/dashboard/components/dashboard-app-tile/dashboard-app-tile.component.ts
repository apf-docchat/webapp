import { Component, Input } from '@angular/core';
import { NzIconModule } from "ng-zorro-antd/icon";

@Component({
  selector: 'app-dashboard-app-tile',
  standalone: true,
  imports: [
    NzIconModule
  ],
  templateUrl: './dashboard-app-tile.component.html',
  styleUrl: './dashboard-app-tile.component.less'
})
export class DashboardAppTileComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) label!: string;
  @Input() iconBgColor?: string = '#3B7DE0';
  @Input() iconColor?: string = '#FFFFFF';
}
