import {Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {
  }

  async register({email, password}) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (e) {
      return null;
    }
  }

  async login({email, password}) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (e) {
      return null;
    }
  }

  logout() {
    return signOut(this.auth);
  }
}
