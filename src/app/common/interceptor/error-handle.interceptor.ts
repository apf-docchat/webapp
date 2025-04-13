import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { UserAuthService } from '../services/user-auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export const errorHandleInterceptor: HttpInterceptorFn = (req, next) => {
  const userAuthSer = inject(UserAuthService);
  const notification = inject(NzNotificationService)
  // return next(req);
  return next(req).pipe(
    // Handle successful responses if needed
    tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // Do something with successful responses (optional)
      }
    }),
    // Handle errors
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          notification.create(
            'warning',
            'Warning',
            error.error.message,
            { nzPlacement: 'bottomLeft' }
          );
          userAuthSer.logoutUser();
          return next(req);
        default:
          console.error('Error:', error);
          /* notification.create(
            'warning',
            'Warning',
            'Some issue at backend. Please try again later',
            { nzPlacement: 'bottomLeft' }
          ); */
          return throwError(() => new Error('Something bad happened; please try again later'));

      }
    })
  );
};
