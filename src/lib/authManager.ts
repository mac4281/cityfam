import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  increment,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export enum AuthError {
  REQUIRES_RECENT_LOGIN = 'REQUIRES_RECENT_LOGIN',
  DELETION_FAILED = 'DELETION_FAILED',
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
}

export class AuthManager {
  private unsubscribe: Unsubscribe | null = null;
  private listeners: Set<(isSignedIn: boolean, user: User | null) => void> = new Set();

  constructor() {
    // Set up auth state listener
    this.unsubscribe = onAuthStateChanged(auth, (user) => {
      const isSignedIn = user != null;
      this.notifyListeners(isSignedIn, user);
    });
  }

  // Subscribe to auth state changes
  subscribe(callback: (isSignedIn: boolean, user: User | null) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current state
    const currentUser = auth.currentUser;
    callback(currentUser != null, currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(isSignedIn: boolean, user: User | null) {
    this.listeners.forEach((callback) => callback(isSignedIn, user));
  }

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email.trim(), 
      password
    );
    return userCredential.user;
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    try {
      // Create the authentication user
      const authResult = await createUserWithEmailAndPassword(auth, email, password);
      const uid = authResult.user.uid;

      // Create the user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: name,
        email: email,
        created_at: serverTimestamp(),
        attending_events: [], // Array to store event IDs user is attending
        saved_jobs: [], // Array to store saved job IDs
      });

      // Increment global analytics counter
      await updateDoc(doc(db, 'analytics', 'global'), {
        users: increment(1),
      });

      console.log('Created user document for uid:', uid);
      return authResult.user;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async deleteAccount(password?: string): Promise<void> {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error(AuthError.NOT_LOGGED_IN);
    }

    try {
      // If password is provided, re-authenticate first
      if (password && currentUser.email) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Try to delete the user
      const uid = currentUser.uid;
      
      // Delete user document from Firestore first
      await deleteDoc(doc(db, 'users', uid));
      
      // Then delete the auth user
      await deleteUser(currentUser);
    } catch (error: any) {
      console.error('Error during account deletion:', error);
      
      // Check if it's a re-authentication error
      if (error.code === 'auth/requires-recent-login') {
        // Sign out the user
        await firebaseSignOut(auth);
        throw new Error(AuthError.REQUIRES_RECENT_LOGIN);
      }
      
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Cleanup method
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export const authManager = new AuthManager();
