import { Injectable } from '@angular/core';
import { CanActivate, Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    public afAuth: AngularFireAuth,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (user) {
      return true; // Allow access if authenticated
    } else {
      this.router.navigate(['/login']);
      return false; // Redirect to login if not authenticated
    }
  }
}
