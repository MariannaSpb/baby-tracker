import { Injectable, signal, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, User, authState, signInWithPopup, signOut, getIdToken } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  
  public user = signal<User | null>(null);
  public isInitialized = signal<boolean>(false);

  constructor() {
    authState(this.auth).subscribe((user: User | null) => {
      this.user.set(user);
      this.isInitialized.set(true);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  async getToken(): Promise<string | null> {
    if (!this.auth.currentUser) return null;
    return getIdToken(this.auth.currentUser);
  }
}
