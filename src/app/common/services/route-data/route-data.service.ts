import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, mergeMap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RouteDataService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  getRouteData() {
    return this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data)
      )
  }
}
