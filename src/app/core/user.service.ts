import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { onAuthStateChanged, User } from "firebase/auth";
import { error } from "console";
@Injectable(
  {
    providedIn: 'root'
  }
)
export class UserService {

  constructor(
    public db: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {
  }


  getCurrentUser() {
    let currUser = this.afAuth.currentUser
    return currUser;
  }

  // TODO: implement the update user method
  // updateCurrentUser(value: { name: any; }) {
  //   return new Promise<any>((resolve, reject) => {
  //     var user = auth().currentUser;
  //     user.updateProfile({
  //       displayName: value.name,
  //       photoURL: user.photoURL
  //     }).then((res: any) => {
  //       resolve(res);
  //     }, (err: any) => reject(err))
  //   })
  // }
}
