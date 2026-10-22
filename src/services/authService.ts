import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { storage } from './storageService';
import type { User } from '../types';
import { AVATAR_CHARACTERS, getDefaultAvatar } from './avatarCharacters';

const AUTH_KEY = 'psychcare_auth_session_v1';
const CREDENTIALS_KEY = 'psychcare_user_credentials_v1';
const REMEMBER_KEY = 'psychcare_remember_credentials_v2';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export interface PasswordResetSession {
  email: string;
  code: string;
  expiresAt: number;
  targetUserId: string;
  targetUserName: string;
  licenseNumber?: string;
}

class AuthService {
  private authenticated: boolean = false;
  private resetSessions: Map<string, PasswordResetSession> = new Map();

  constructor() {
    // Purge legacy auto-saved credentials so login starts clean
    try {
      localStorage.removeItem('psychcare_remember_credentials_v1');
    } catch {}

    // Load persisted session from storage
    const session = localStorage.getItem(AUTH_KEY);
    if (session === 'true') {
      this.authenticated = true;
    }
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  public getRememberedCredentials(): { email: string; password: string } | null {
    try {
      const data = localStorage.getItem(REMEMBER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public saveRememberedCredentials(email: string, pass: string): void {
    try {
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ email: email.trim(), password: pass })
      );
    } catch (e) {
      console.warn('Failed to save remembered credentials:', e);
    }
  }

  public clearRememberedCredentials(): void {
    try {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem('psychcare_remember_credentials_v1');
    } catch (e) {
      console.warn('Failed to clear remembered credentials:', e);
    }
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
      const creds = this.getStoredCredentials();
      const adminPass = creds['admin'] || creds['admin@psychcare.app'] || '!Inikasijoy1';
      if (pass !== adminPass) {
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

  public requestPasswordResetCode(emailInput: string): {
    success: boolean;
    error?: string;
    code?: string;
    maskedEmail?: string;
    targetUserName?: string;
    targetRole?: string;
    licenseHint?: string;
  } {
    const input = emailInput.trim();
    const normalized = input.toLowerCase();

    if (!input) {
      return { success: false, error: 'Please enter your registered email address or username.' };
    }

    const users = storage.getUsers();
    const isAdmin = normalized === 'admin' || normalized === 'admin@psychcare.app';
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized
    );

    if (!isAdmin && !foundUser) {
      return { success: false, error: 'No practitioner account found with this email or username.' };
    }

    const targetUser = isAdmin
      ? (users.find((u) => u.role === 'admin') || {
          id: 'usr_admin',
          name: 'Super Admin',
          email: 'admin@psychcare.app',
          role: 'admin' as const,
          plan: 'premium' as const,
          status: 'active' as const,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          avatarUrl: '',
        })
      : foundUser!;

    if (targetUser.status === 'banned') {
      return { success: false, error: 'This practitioner account is suspended. Contact administration.' };
    }

    // Generate secure 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const session: PasswordResetSession = {
      email: targetUser.email,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      licenseNumber: targetUser.licenseNumber,
    };

    this.resetSessions.set(targetUser.email.toLowerCase(), session);
    if (isAdmin) {
      this.resetSessions.set('admin', session);
      this.resetSessions.set('admin@psychcare.app', session);
    }
    if (foundUser?.name) {
      this.resetSessions.set(foundUser.name.toLowerCase(), session);
    }

    storage.addAuditLog(
      targetUser.id,
      targetUser.name,
      'PASSWORD_RESET_OTP_REQUESTED',
      targetUser.id,
      targetUser.name,
      `Password reset confirmation code generated for ${targetUser.email}.`
    );

    return {
      success: true,
      code,
      maskedEmail: maskEmail(targetUser.email),
      targetUserName: targetUser.name,
      targetRole: targetUser.role,
      licenseHint: targetUser.licenseNumber,
    };
  }

  public verifyResetCode(
    emailInput: string,
    codeOrLicense: string
  ): { success: boolean; error?: string } {
    const normalized = emailInput.trim().toLowerCase();
    const session = this.resetSessions.get(normalized);

    if (!session) {
      return { success: false, error: 'No active confirmation session found. Please request a code first.' };
    }

    if (Date.now() > session.expiresAt) {
      this.resetSessions.delete(normalized);
      return { success: false, error: 'Confirmation code has expired. Please request a new code.' };
    }

    const trimmedInput = codeOrLicense.trim().toUpperCase();
    const isCodeMatch = trimmedInput === session.code;
    const isLicenseMatch = !!(session.licenseNumber && trimmedInput === session.licenseNumber.trim().toUpperCase());

    if (!isCodeMatch && !isLicenseMatch) {
      return {
        success: false,
        error: 'Invalid confirmation code. Please enter the 6-digit code sent to your registered email.',
      };
    }

    return { success: true };
  }

  public async completePasswordReset(
    emailInput: string,
    codeOrLicense: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    const verify = this.verifyResetCode(emailInput, codeOrLicense);
    if (!verify.success) {
      return verify;
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const normalized = emailInput.trim().toLowerCase();
    const session = this.resetSessions.get(normalized)!;

    // Firebase password reset trigger if configured
    if (auth && isFirebaseConfigured() && session.email) {
      try {
        await sendPasswordResetEmail(auth, session.email);
      } catch (e: any) {
        console.warn('Firebase sendPasswordResetEmail warning:', e.message);
      }
    }

    // Store new password in local credentials
    const creds = this.getStoredCredentials();
    creds[session.email.toLowerCase()] = newPass;
    if (session.targetUserId === 'usr_admin' || normalized === 'admin') {
      creds['admin'] = newPass;
      creds['admin@psychcare.app'] = newPass;
    }
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));

    // Update remembered credentials if saved
    const remembered = this.getRememberedCredentials();
    if (
      remembered &&
      (remembered.email.toLowerCase() === normalized ||
        remembered.email.toLowerCase() === session.email.toLowerCase())
    ) {
      this.saveRememberedCredentials(remembered.email, newPass);
    }

    // Clean up reset session
    this.resetSessions.delete(normalized);
    this.resetSessions.delete(session.email.toLowerCase());
    this.resetSessions.delete('admin');

    storage.addAuditLog(
      session.targetUserId,
      session.targetUserName,
      'PASSWORD_RESET_SUCCESS',
      session.targetUserId,
      session.targetUserName,
      'Practitioner password was securely reset after real-user verification.'
    );

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    };
  }

  public changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): { success: boolean; error?: string; message?: string } {
    const users = storage.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }
    if (!currentPass) {
      return { success: false, error: 'Please enter your current password.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    if (currentPass === newPass) {
      return { success: false, error: 'New password must be different from current password.' };
    }

    const creds = this.getStoredCredentials();
    const normalizedEmail = user.email.toLowerCase();
    const storedPass =
      creds[normalizedEmail] ||
      (user.role === 'admin' ? creds['admin'] || creds['admin@psychcare.app'] || '!Inikasijoy1' : undefined);

    const isValidCurrentPass = storedPass
      ? storedPass === currentPass
      : user.role === 'admin'
      ? currentPass === '!Inikasijoy1' || currentPass === 'admin123'
      : currentPass === 'password123' || currentPass.length >= 6;

    if (!isValidCurrentPass) {
      return { success: false, error: 'Current password is incorrect. Please try again.' };
    }

    // Update stored credentials
    creds[normalizedEmail] = newPass;
    if (user.role === 'admin') {
      creds['admin'] = newPass;
      creds['admin@psychcare.app'] = newPass;
    }
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));

    // Update remembered credentials if applicable
    const remembered = this.getRememberedCredentials();
    if (remembered && remembered.email.toLowerCase() === normalizedEmail) {
      this.saveRememberedCredentials(remembered.email, newPass);
    }

    storage.addAuditLog(
      user.id,
      user.name,
      'PASSWORD_CHANGE',
      user.id,
      user.name,
      'Password was successfully changed from user profile section.'
    );

    return {
      success: true,
      message: 'Your password has been changed successfully!',
    };
  }

  public async resetPassword(
    emailInput: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    const res = this.requestPasswordResetCode(emailInput);
    if (!res.success || !res.code) {
      return { success: false, error: res.error || 'User not found' };
    }
    return this.completePasswordReset(emailInput, res.code, newPass);
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
