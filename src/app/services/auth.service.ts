import {Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})

/**
 * Authentication Service to be injected to each page to allow Firebase Authentication
 */
export class AuthService {
  constructor(private auth: Auth) {
  }

  /**
   * Register the user to Firebase with email and password
   *
   * @param email The email of the user
   * @param password The password of the user
   */
  async register({email, password}) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (e) {
      return null;
    }
  }

  /**
   * Login the user to Firebase with email and password
   *
   * @param email The email of the user
   * @param password The password of the user
   */
  async login({email, password}) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (e) {
      return null;
    }
  }

  /**
   * Logout the user from Firebase
   */
  logout() {
    return signOut(this.auth);
  }
}
