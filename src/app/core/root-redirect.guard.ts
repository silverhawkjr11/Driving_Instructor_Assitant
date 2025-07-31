import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const rootRedirectGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        // User is authenticated, redirect to my-students
        router.navigate(['/my-students']);
      } else {
        // User is not authenticated, redirect to login
        router.navigate(['/login']);
      }
      return false; // Always return false since we're redirecting
    })
  );
};