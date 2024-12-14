import { inject, Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { createUserWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { Auth } from "firebase/auth";
import { ResolveData } from "@angular/router";
@Injectable(
  {
    providedIn: 'root'
  }
)
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth
  ) { }

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      let provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth
        .signInWithPopup(provider)
        .then(res => {
          resolve(res);
        }, err => {
          console.log(err);
          reject(err);
        })
    })
  }

  doRegister(value: { email: any; password: any; }) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(value.email, value.password).then(
        res => {
          resolve(res);
        }, err => reject(err)
      )
    })
  }

  doLogin(value: { email: any; password: any; }) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(value.email, value.password).then(
        res => {
          resolve(res);
        }, err => reject(err)
      )
    })
  }
  // TODO: ResolveData
  doLogout() {
    return new Promise((resolve, reject) => {
      this.afAuth.signOut()
    })
  }


}
