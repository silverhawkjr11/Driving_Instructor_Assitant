import { Injectable } from "@angular/core";
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Auth, updateProfile, user } from '@angular/fire/auth';
import { User } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    public firestore: Firestore,
    public auth: Auth
  ) { }
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      resolve(this.auth.currentUser);
    });
  }

  updateCurrentUser(value: { name: string }) {
    return new Promise<void>(async (resolve, reject) => {
      const user = this.auth.currentUser;
      if (!user) {
        reject(new Error('No user logged in'));
        return;
      }

      try {
        await updateProfile(user, {
          displayName: value.name
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
