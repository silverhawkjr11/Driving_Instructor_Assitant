import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { UserService } from '../core/user.service';
import { FirebaseUserModel } from '../core/user.model';

@Injectable()
export class UserResolver implements Resolve<FirebaseUserModel> {

  constructor(public userService: UserService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot): Promise<FirebaseUserModel> {

    let user = new FirebaseUserModel();

    return new Promise((resolve, reject) => {
      this.userService.getCurrentUser()
        .then(res => {
          if (res && res.providerData && res.providerData[0]) {
            if (res.providerData[0].providerId == 'password') {
              user.name = res.displayName || '';
              user.provider = res.providerData[0].providerId;
              return resolve(user);
            } else {
              user.provider = res.providerData[0].providerId;
              return resolve(user);
            }
          } else {
            this.router.navigate(['/login']);
            return reject('No user data available');
          }
        }, err => {
          this.router.navigate(['/login']);
          return reject(err);
        })
    })
  }
}
