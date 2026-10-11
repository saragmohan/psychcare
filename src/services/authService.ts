import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { storage } from './storageService';
import type { User } from '../types';
import { AVATAR_CHARACTERS, getDefaultAvatar } from './avatarCharacters';

const AUTH_KEY = 'psychcare_auth_session_v1';
const CREDENTIALS_KEY = 'psychcare_user_credentials_v1';

class AuthService {
  private authenticated: boolean = false;

  constructor() {
    // Load persisted session from storage
    const session = localStorage.getItem(AUTH_KEY);
    if (session === 'true') {
      this.authenticated = true;
    }
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  private getStoredCredentials(): Record<string, string> {
    try {
      const data = localStorage.getItem(CREDENTIALS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public async login(
    email: string,
    pass: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const input = email.trim();
    const normalized = input.toLowerCase();

    // 1. Explicit Administrator Authentication
    if (normalized === 'admin' || normalized === 'admin@psychcare.app') {
      if (pass !== '!Inikasijoy1') {
        return { success: false, error: 'Incorrect password for admin account.' };
      }
      const users = storage.getUsers();
      const adminUser = users.find((u) => u.role === 'admin' || u.id === 'usr_admin') || {
        id: 'usr_admin',
        name: 'admin',
        email: 'admin@psychcare.app',
        avatarUrl: AVATAR_CHARACTERS[0].dataUrl,
        role: 'admin',
        plan: 'premium',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      storage.setCurrentUser(adminUser.id);
      this.setSession(true);
      return { success: true, user: adminUser };
    }

    // 2. Try Firebase Auth if configured
    if (auth && isFirebaseConfigured()) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        const users = storage.getUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized
        );
        const targetUser = found || users[0];

        storage.setCurrentUser(targetUser.id);
        this.setSession(true);
        return { success: true, user: targetUser };
      } catch (err: any) {
        console.warn('Firebase login attempt fallback to local auth:', err.message);
      }
    }

    // 3. Local Auth matching for existing demo/registered practitioners
    const users = storage.getUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized
    );

    if (existing) {
      if (existing.status === 'banned') {
        return { success: false, error: 'This practitioner account is suspended by Admin.' };
      }

      // Check Password if stored
      const creds = this.getStoredCredentials();
      const storedPass = creds[existing.email.toLowerCase()];
      if (storedPass && storedPass !== pass) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      storage.setCurrentUser(existing.id);
      this.setSession(true);
      return { success: true, user: existing };
    }

    // 4. Fallback if user doesn't exist
    return { success: false, error: 'Invalid credentials. User not found.' };
  }

  public async signUp(payload: {
    name: string;
    email: string;
    pass: string;
    clinicName?: string;
    licenseNumber?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existingUsers = storage.getUsers();

    if (existingUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    // 1. Firebase Auth user creation if online
    if (auth && isFirebaseConfigured()) {
      try {
        await createUserWithEmailAndPassword(auth, payload.email, payload.pass);
      } catch (e: any) {
        console.warn('Firebase signup warning:', e.message);
      }
    }

    // 2. Create new practitioner user profile with immediate active status
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const newUser: User = {
      id: `usr_psy_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      avatarUrl: payload.avatarUrl || getDefaultAvatar(payload.email),
      role: 'psychologist',
      plan: 'trial',
      status: 'active',
      emailVerified: true,
      createdAt: now.toISOString(),
      trialEndsAt: trialEnd.toISOString(),
      clinicName: payload.clinicName || 'Private Therapy Practice',
      licenseNumber: payload.licenseNumber || 'PSY-ACTIVE',
    };

    // Save user profile in storage service
    storage.addUser(newUser);

    // Save Password locally
    const creds = this.getStoredCredentials();
    creds[normalizedEmail] = payload.pass;
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));

    return { success: true, user: newUser };
  }

  public loginAsDemoUser(userId: string): User {
    storage.setCurrentUser(userId);
    this.setSession(true);
    return storage.getCurrentUser();
  }

  public async logout(): Promise<void> {
    if (auth && isFirebaseConfigured()) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase logout warning:', e);
      }
    }
    this.setSession(false);
    // Ensure active user is reset away from admin upon logout
    const users = storage.getUsers();
    const defaultUser = users.find((u) => u.role !== 'admin') || users[0];
    if (defaultUser) {
      storage.setCurrentUser(defaultUser.id);
    }
  }

  private setSession(active: boolean) {
    this.authenticated = active;
    if (active) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }
}

export const authService = new AuthService();
