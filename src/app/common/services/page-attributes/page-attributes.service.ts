import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, mergeMap, Observable } from "rxjs";
import { PageAttributes } from "./page-attributes.types";

@Injectable({
  providedIn: 'root'
})
export class PageAttributesService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private defaultPageAttributes: PageAttributes = {
    hasUserNav: false,
    hasNavbar: false,
    hasSidebar: false
  }

  get pageAttributes(): Observable<PageAttributes> {
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
        mergeMap((route) => route.data),
        map((routeData) => {
          return {...this.defaultPageAttributes, ...routeData['attributes'] ?? {}}
        })
      )
  }
}
