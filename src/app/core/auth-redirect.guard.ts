import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authRedirectGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        // User is authenticated, redirect to my-students
        router.navigate(['/my-students']);
        return false;
      } else {
        // User is not authenticated, allow access to login page
        return true;
      }
    })
  );
};