import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userAuthSer = inject(UserAuthService);
  const router = inject(Router)
  if (userAuthSer.getUserToken()) {
    return true;
  } else {
    router.navigate(['/auth'])
    return false
  }

};
