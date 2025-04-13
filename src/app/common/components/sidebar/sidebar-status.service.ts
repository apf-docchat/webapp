import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { SidebarStatus } from "./sidebar-status.types";

@Injectable({
  providedIn: 'root'
})
export class SidebarStatusService {
  private _collapsed = new BehaviorSubject<boolean>(false);

  get status(): Observable<SidebarStatus> {
    return combineLatest([this._collapsed])
      .pipe(
        map(([collapsed]) => ({collapsed}))
      );
  }

  get isCollapsed(): Observable<boolean> {
    return this._collapsed.asObservable();
  }

  set collapsed(collapsed: boolean) {
    this._collapsed.next(collapsed);
  }
}
