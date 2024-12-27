import { inject, Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from "firebase/auth";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn$ = new Observable<boolean>(observer => {
    return this.afAuth.authState.subscribe(user => {
      observer.next(!!user);
    });
  });

  constructor(public afAuth: AngularFireAuth) { }

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      const provider = new GoogleAuthProvider();
      this.afAuth.signInWithPopup(provider)
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          console.error('Auth Error:', error);
          reject(error);
        });
    });
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

  doLogout() {
    return new Promise((resolve, reject) => {
      this.afAuth.signOut()
    })
  }
}
