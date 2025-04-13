import { HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserAuthService } from '../services/user-auth.service';
import { LoadingSpinnerService } from '../services/loading-spinner.service';
import { finalize } from 'rxjs';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request to add the authentication header.
  const userAuthSer = inject(UserAuthService)
  const loadingSpinnerSer = inject(LoadingSpinnerService)
  const authToken = userAuthSer.getUserToken()

  if (shouldShowSpinner(req.url)) {
    loadingSpinnerSer.showSpinner.set(true);
  }

  if (authToken) {
    const modifiedRequest = req.clone({
      setHeaders: {
        // 'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return next(modifiedRequest).pipe(
      finalize(() => {
        loadingSpinnerSer.showSpinner.set(false)
      })
    );
  } else {
    return next(req).pipe(
      finalize(() => {
        loadingSpinnerSer.showSpinner.set(false)
      })
    );
  }
}

function shouldShowSpinner(url: string): boolean {
  return !url.includes('doc-analysis/chat');
}