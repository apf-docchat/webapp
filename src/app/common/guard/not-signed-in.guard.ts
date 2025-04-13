import { CanActivateFn, Router } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';
import { inject } from '@angular/core';

export const notSignedInGuard: CanActivateFn = (route, state) => {
  const userAuthSer = inject(UserAuthService);
  const router = inject(Router)
  if (!userAuthSer.getUserToken()) {
    return true;
  } else {
    router.navigate(['/dashboard'])
    return false
  }
};
