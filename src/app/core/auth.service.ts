import { inject, Injectable } from "@angular/core";
import { Auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState } from '@angular/fire/auth';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  isLoggedIn$ = new Observable<boolean>(observer => {
    return authState(this.auth).subscribe(user => {
      observer.next(!!user);
    });
  });
  user$: any;

  constructor() { }

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(this.auth, provider)
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
      createUserWithEmailAndPassword(this.auth, value.email, value.password).then(
        res => {
          resolve(res);
        }, err => reject(err)
      )
    })
  }
  doLogin(value: { email: any; password: any; }) {
    console.log('Auth service: starting login process');
    return new Promise<any>((resolve, reject) => {
      console.log('Auth service: sending request to Firebase');
      signInWithEmailAndPassword(this.auth, value.email, value.password)
        .then(res => {
          console.log('Login successful', res);
          resolve(res);
        })
        .catch(error => {
          console.error('Auth Service: Login error', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          reject(error);
        });
    });
  }
  // doLogin(value: { email: any; password: any; }) {
  //   return new Promise<any>((resolve, reject) => {
  //     signInWithEmailAndPassword(this.auth, value.email, value.password).then(
  //       res => {
  //         resolve(res);
  //       }, err => reject(err)
  //     )
  //   })
  // }

  doLogout() {
    return signOut(this.auth);
  }
}
