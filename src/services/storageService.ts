import type { User, Client, SessionNote, AssessmentResult, Appointment, AdminAuditLog, PaymentInvoice, WebCheckoutPayload, DirectPaymentConfig } from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_NOTES,
  INITIAL_ASSESSMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INVOICES,
} from './mockData';
import { getDefaultAvatar } from './avatarCharacters';

const DEFAULT_PAYMENT_CONFIG: DirectPaymentConfig = {
  upiId: 'psychcare@icici',
  payeeName: 'PsychCare Clinical OS',
  monthlyPaymentLink: 'https://rzp.io/l/psychcare-monthly',
  yearlyPaymentLink: 'https://rzp.io/l/psychcare-annual',
  bankDetails: {
    bankName: 'HDFC Bank',
    accountHolder: 'PsychCare Health Technologies Pvt Ltd',
    accountNumber: '50200088991122',
    ifscCode: 'HDFC0001234',
  },
};

const KEYS = {
  USERS: 'psychcare_users_v1',
  CURRENT_USER_ID: 'psychcare_current_user_id_v1',
  CLIENTS: 'psychcare_clients_v1',
  NOTES: 'psychcare_notes_v1',
  ASSESSMENTS: 'psychcare_assessments_v1',
  APPOINTMENTS: 'psychcare_appointments_v1',
  LOGS: 'psychcare_logs_v1',
  INVOICES: 'psychcare_invoices_v1',
  PAYMENT_CONFIG: 'psychcare_payment_config_v1',
};

class StorageService {
  private users: User[];
  private currentUserId: string;
  private clients: Client[];
  private notes: SessionNote[];
  private assessments: AssessmentResult[];
  private appointments: Appointment[];
  private logs: AdminAuditLog[];
  private invoices: PaymentInvoice[];
  private paymentConfig: DirectPaymentConfig;
  private listeners: (() => void)[] = [];

  constructor() {
    this.users = this.load(KEYS.USERS, INITIAL_USERS);
    this.currentUserId = this.load(KEYS.CURRENT_USER_ID, 'usr_psy_1');
    this.clients = this.load(KEYS.CLIENTS, INITIAL_CLIENTS);
    this.notes = this.load(KEYS.NOTES, INITIAL_NOTES);
    this.assessments = this.load(KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    this.appointments = this.load(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    this.logs = this.load(KEYS.LOGS, INITIAL_AUDIT_LOGS);
    this.invoices = this.load(KEYS.INVOICES, INITIAL_INVOICES);
    this.paymentConfig = this.load(KEYS.PAYMENT_CONFIG, DEFAULT_PAYMENT_CONFIG);

    this.checkTrialExpirations();

    // Ensure admin user has dedicated private test workspace data without exposing other practitioners' records
    if (!this.clients.some((c) => c.psychologistId === 'usr_admin')) {
      const adminClient = INITIAL_CLIENTS.find((c) => c.psychologistId === 'usr_admin');
      if (adminClient) {
        this.clients.push(adminClient);
        this.save(KEYS.CLIENTS, this.clients);
      }
    }

    if (!this.notes.some((n) => n.psychologistId === 'usr_admin')) {
      const adminNotes = INITIAL_NOTES.filter((n) => n.psychologistId === 'usr_admin');
      if (adminNotes.length > 0) {
        this.notes.push(...adminNotes);
        this.save(KEYS.NOTES, this.notes);
      }
    }

    if (!this.assessments.some((a) => a.psychologistId === 'usr_admin')) {
      const adminAssessments = INITIAL_ASSESSMENTS.filter((a) => a.psychologistId === 'usr_admin');
      if (adminAssessments.length > 0) {
        this.assessments.push(...adminAssessments);
        this.save(KEYS.ASSESSMENTS, this.assessments);
      }
    }

    if (!this.appointments.some((a) => a.psychologistId === 'usr_admin')) {
      const adminAppts = INITIAL_APPOINTMENTS.filter((a) => a.psychologistId === 'usr_admin');
      if (adminAppts.length > 0) {
        this.appointments.push(...adminAppts);
        this.save(KEYS.APPOINTMENTS, this.appointments);
      }
    }

    // Ensure admin user is synced with name 'admin'
    const adminUser = this.users.find((u) => u.role === 'admin' || u.id === 'usr_admin');
    if (adminUser && adminUser.name !== 'admin') {
      adminUser.name = 'admin';
    }

    // Ensure all users are active and use character avatars instead of photo headshots
    let updatedUsers = false;
    this.users = this.users.map((u, idx) => {
      let changed = false;
      let userObj = { ...u };
      if (userObj.status === 'pending_verification' || userObj.emailVerified === false || userObj.emailVerified === undefined) {
        userObj.status = userObj.status === 'banned' ? 'banned' : 'active';
        userObj.emailVerified = true;
        changed = true;
      }
      if (!userObj.avatarUrl || userObj.avatarUrl.includes('unsplash.com')) {
        userObj.avatarUrl = getDefaultAvatar(userObj.id || userObj.email || String(idx));
        changed = true;
      }
      if (changed) updatedUsers = true;
      return userObj;
    });
    if (updatedUsers || (adminUser && adminUser.name !== 'admin')) {
      this.save(KEYS.USERS, this.users);
    }
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private save(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public checkTrialExpirations() {
    let changed = false;
    const now = new Date();

    this.users = this.users.map((user) => {
      if (user.plan === 'trial') {
        const trialEnd = new Date(user.trialEndsAt);
        if (now > trialEnd) {
          changed = true;
          return { ...user, plan: 'free' };
        }
      }
      return user;
    });

    if (changed) {
      this.save(KEYS.USERS, this.users);
    }
  }

  public getTrialTimeRemaining(user: User): {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
    formatted: string;
  } {
    if (user.plan !== 'trial') {
      return { expired: true, days: 0, hours: 0, minutes: 0, formatted: 'Trial Ended' };
    }

    const now = new Date().getTime();
    const end = new Date(user.trialEndsAt).getTime();
    const diffMs = end - now;

    if (diffMs <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, formatted: '0d 0h 0m' };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return {
      expired: false,
      days,
      hours,
      minutes,
      formatted: `${days}d ${hours}h ${minutes}m`,
    };
  }

  public canAccessPremiumFeature(user: User): boolean {
    if (user.role === 'admin') return true;
    if (user.status === 'banned') return false;
    if (user.plan === 'premium') return true;
    if (user.plan === 'trial') {
      const remaining = this.getTrialTimeRemaining(user);
      return !remaining.expired;
    }
    return false;
  }

  public canAddClient(user: User): { allowed: boolean; reason?: string } {
    if (user.status === 'banned') return { allowed: false, reason: 'Account is suspended' };
    if (this.canAccessPremiumFeature(user)) return { allowed: true };

    const userClientsCount = this.clients.filter(
      (c) => c.psychologistId === user.id && c.status === 'active'
    ).length;

    if (userClientsCount >= 3) {
      return {
        allowed: false,
        reason: 'Free tier is limited to 3 active clients. Upgrade to Premium for unlimited clients.',
      };
    }

    return { allowed: true };
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUser(newUser: User) {
    this.users = [newUser, ...this.users.filter((u) => u.id !== newUser.id)];
    this.save(KEYS.USERS, this.users);
  }

  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    return user || this.users[0];
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    this.save(KEYS.CURRENT_USER_ID, userId);
  }

  public adminGrantPremium(targetUserId: string, daysValid: number = 365) {
    const admin = this.getCurrentUser();
    const expiry = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

    let targetName = '';
    let updatedUser: User | null = null;
    this.users = this.users.map((u) => {
      if (u.id === targetUserId) {
        targetName = u.name;
        updatedUser = { ...u, plan: 'premium', premiumExpiresAt: expiry };
        return updatedUser;
      }
      return u;
    });

    this.addAuditLog(
      admin.id,
      admin.name,
      'GRANT_PREMIUM',
      targetUserId,
      targetName,
      `Granted ${daysValid} days of Premium access.`
    );

    this.save(KEYS.USERS, this.users);
  }

  public adminRevokePremium(targetUserId: string) {
    const admin = this.getCurrentUser();
    let targetName = '';
    let updatedUser: User | null = null;

    this.users = this.users.map((u) => {
      if (u.id === targetUserId) {
        targetName = u.name;
        updatedUser = { ...u, plan: 'free', premiumExpiresAt: undefined };
        return updatedUser;
      }
      return u;
    });

    this.addAuditLog(
      admin.id,
      admin.name,
      'REVOKE_PREMIUM',
      targetUserId,
      targetName,
      'Revoked Premium access; user reverted to Free plan.'
    );

    this.save(KEYS.USERS, this.users);
  }

  public adminBanUser(targetUserId: string) {
    const admin = this.getCurrentUser();
    let targetName = '';
    let updatedUser: User | null = null;

    this.users = this.users.map((u) => {
      if (u.id === targetUserId) {
        targetName = u.name;
        updatedUser = { ...u, status: 'banned' };
        return updatedUser;
      }
      return u;
    });

    this.addAuditLog(
      admin.id,
      admin.name,
      'BAN_USER',
      targetUserId,
      targetName,
      'Banned user account and revoked access tokens.'
    );

    this.save(KEYS.USERS, this.users);
  }

  public adminUnbanUser(targetUserId: string) {
    const admin = this.getCurrentUser();
    let targetName = '';
    let updatedUser: User | null = null;

    this.users = this.users.map((u) => {
      if (u.id === targetUserId) {
        targetName = u.name;
        updatedUser = { ...u, status: 'active' };
        return updatedUser;
      }
      return u;
    });

    this.addAuditLog(
      admin.id,
      admin.name,
      'UNBAN_USER',
      targetUserId,
      targetName,
      'Restored banned user account.'
    );

    this.save(KEYS.USERS, this.users);
  }

  public adminExtendTrial(targetUserId: string, days: number = 3) {
    const admin = this.getCurrentUser();
    let targetName = '';
    let updatedUser: User | null = null;

    this.users = this.users.map((u) => {
      if (u.id === targetUserId) {
        targetName = u.name;
        const currentTrialEnd = new Date(u.trialEndsAt);
        const baseDate = currentTrialEnd > new Date() ? currentTrialEnd : new Date();
        const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
        updatedUser = { ...u, plan: 'trial', trialEndsAt: newEnd };
        return updatedUser;
      }
      return u;
    });

    this.addAuditLog(
      admin.id,
      admin.name,
      'EXTEND_TRIAL',
      targetUserId,
      targetName,
      `Extended trial by ${days} days.`
    );

    this.save(KEYS.USERS, this.users);
  }

  public adminDeleteUser(targetUserId: string): boolean {
    const admin = this.getCurrentUser();
    const targetUser = this.users.find((u) => u.id === targetUserId);
    if (!targetUser || targetUser.role === 'admin') {
      return false;
    }

    const targetName = targetUser.name;
    const targetEmail = targetUser.email;

    // Remove user
    this.users = this.users.filter((u) => u.id !== targetUserId);

    // Cascade clean up practitioner's clients and related records
    const userClients = this.clients.filter((c) => c.psychologistId === targetUserId);
    const clientIds = new Set(userClients.map((c) => c.id));

    this.clients = this.clients.filter((c) => c.psychologistId !== targetUserId);
    this.notes = this.notes.filter((n) => n.psychologistId !== targetUserId && !clientIds.has(n.clientId));
    this.assessments = this.assessments.filter((a) => a.psychologistId !== targetUserId && !clientIds.has(a.clientId));
    this.appointments = this.appointments.filter((ap) => ap.psychologistId !== targetUserId && !clientIds.has(ap.clientId));

    this.addAuditLog(
      admin.id,
      admin.name,
      'DELETE_USER',
      targetUserId,
      targetName,
      `Permanently removed practitioner account ${targetName} (${targetEmail}) and associated records.`
    );

    this.save(KEYS.USERS, this.users);
    this.save(KEYS.CLIENTS, this.clients);
    this.save(KEYS.NOTES, this.notes);
    this.save(KEYS.ASSESSMENTS, this.assessments);
    this.save(KEYS.APPOINTMENTS, this.appointments);

    // If deleted user was active in local storage, revert to admin
    if (this.currentUserId === targetUserId) {
      this.setCurrentUser('usr_admin');
    }

    return true;
  }

  public addAuditLog(
    adminId: string,
    adminName: string,
    action: string,
    targetUserId: string,
    targetUserName: string,
    details: string
  ) {
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminId,
      adminName,
      action,
      targetUserId,
      targetUserName,
      details,
    };
    this.logs = [newLog, ...this.logs];
    this.save(KEYS.LOGS, this.logs);
  }

  public getAuditLogs(): AdminAuditLog[] {
    return this.logs;
  }

  public getClients(psychologistId?: string): Client[] {
    if (psychologistId) {
      return this.clients.filter((c) => c.psychologistId === psychologistId);
    }
    return this.clients;
  }

  public getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id);
  }

  public addClient(client: Omit<Client, 'id' | 'createdAt' | 'totalSessions'>): Client {
    const newClient: Client = {
      ...client,
      id: `cli_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSessions: 0,
    };
    this.clients = [newClient, ...this.clients];
    this.save(KEYS.CLIENTS, this.clients);
    return newClient;
  }

  public deleteClient(clientId: string): boolean {
    const clientToDelete = this.clients.find((c) => c.id === clientId);
    if (!clientToDelete) return false;

    // Remove client
    this.clients = this.clients.filter((c) => c.id !== clientId);

    // Cascade delete notes, assessments, and appointments for this client
    this.notes = this.notes.filter((n) => n.clientId !== clientId);
    this.assessments = this.assessments.filter((a) => a.clientId !== clientId);
    this.appointments = this.appointments.filter((a) => a.clientId !== clientId);

    this.save(KEYS.CLIENTS, this.clients);
    this.save(KEYS.NOTES, this.notes);
    this.save(KEYS.ASSESSMENTS, this.assessments);
    this.save(KEYS.APPOINTMENTS, this.appointments);

    return true;
  }

  public getNotesForClient(clientId: string, psychologistId?: string): SessionNote[] {
    return this.notes
      .filter((n) => n.clientId === clientId && (!psychologistId || n.psychologistId === psychologistId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addSessionNote(note: Omit<SessionNote, 'id' | 'createdAt'>): SessionNote {
    const newNote: SessionNote = {
      ...note,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.notes = [newNote, ...this.notes];

    this.clients = this.clients.map((c) => {
      if (c.id === note.clientId) {
        return {
          ...c,
          totalSessions: c.totalSessions + 1,
          lastSessionDate: note.date,
        };
      }
      return c;
    });

    this.save(KEYS.NOTES, this.notes);
    this.save(KEYS.CLIENTS, this.clients);

    return newNote;
  }

  public getAssessmentsForClient(clientId: string, psychologistId?: string): AssessmentResult[] {
    return this.assessments
      .filter((a) => a.clientId === clientId && (!psychologistId || a.psychologistId === psychologistId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public addAssessmentResult(
    result: Omit<AssessmentResult, 'id'>
  ): AssessmentResult {
    const newAssessment: AssessmentResult = {
      ...result,
      id: `ass_${Date.now()}`,
    };
    this.assessments = [...this.assessments, newAssessment];
    this.save(KEYS.ASSESSMENTS, this.assessments);
    return newAssessment;
  }

  public getAppointments(psychologistId?: string): Appointment[] {
    if (psychologistId) {
      return this.appointments.filter((a) => a.psychologistId === psychologistId);
    }
    return this.appointments;
  }

  public addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
    const newApp: Appointment = {
      ...appointment,
      id: `app_${Date.now()}`,
    };
    this.appointments = [...this.appointments, newApp];
    this.save(KEYS.APPOINTMENTS, this.appointments);
    return newApp;
  }

  public deleteAppointment(appointmentId: string): boolean {
    const apptToDelete = this.appointments.find((a) => a.id === appointmentId);
    if (!apptToDelete) return false;

    this.appointments = this.appointments.filter((a) => a.id !== appointmentId);
    this.save(KEYS.APPOINTMENTS, this.appointments);
    return true;
  }

  public deleteSessionNote(noteId: string): boolean {
    const noteToDelete = this.notes.find((n) => n.id === noteId);
    if (!noteToDelete) return false;

    this.notes = this.notes.filter((n) => n.id !== noteId);
    this.save(KEYS.NOTES, this.notes);
    return true;
  }

  public deleteAssessmentResult(assessmentId: string): boolean {
    const assessmentToDelete = this.assessments.find((a) => a.id === assessmentId);
    if (!assessmentToDelete) return false;

    this.assessments = this.assessments.filter((a) => a.id !== assessmentId);
    this.save(KEYS.ASSESSMENTS, this.assessments);
    return true;
  }

  public getAllSessionNotes(): SessionNote[] {
    return this.notes;
  }

  public getAllAssessments(): AssessmentResult[] {
    return this.assessments;
  }

  public adminCreatePractitioner(payload: {
    name: string;
    email: string;
    clinicName?: string;
    licenseNumber?: string;
    plan: 'trial' | 'premium' | 'free';
  }): User {
    const admin = this.getCurrentUser();
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const premiumExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const newUser: User = {
      id: `usr_psy_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      avatarUrl: getDefaultAvatar(payload.email),
      role: 'psychologist',
      plan: payload.plan,
      status: 'active',
      createdAt: now.toISOString(),
      trialEndsAt: payload.plan === 'trial' ? trialEnd : now.toISOString(),
      premiumExpiresAt: payload.plan === 'premium' ? premiumExpiry : undefined,
      clinicName: payload.clinicName || 'Private Practice',
      licenseNumber: payload.licenseNumber || 'PSY-PENDING',
    };

    this.users = [newUser, ...this.users];
    this.save(KEYS.USERS, this.users);

    this.addAuditLog(
      admin.id,
      admin.name,
      'CREATE_USER',
      newUser.id,
      newUser.name,
      `Manually provisioned new practitioner account (${payload.email}) on ${payload.plan.toUpperCase()} tier.`
    );

    return newUser;
  }

  public updateAppointmentStatus(
    id: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) {
    this.appointments = this.appointments.map((a) => {
      if (a.id === id) {
        return { ...a, status };
      }
      return a;
    });
    this.save(KEYS.APPOINTMENTS, this.appointments);
  }

  public verifyUserEmail(email: string): User | null {
    let verifiedUser: User | null = null;
    this.users = this.users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        verifiedUser = {
          ...u,
          status: 'active',
          emailVerified: true,
        };
        return verifiedUser;
      }
      return u;
    });

    if (verifiedUser) {
      this.save(KEYS.USERS, this.users);
    }
    return verifiedUser;
  }

  public adminVerifyUser(userId: string): boolean {
    const admin = this.getCurrentUser();
    let targetUser: User | null = null;
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        targetUser = { ...u, status: 'active', emailVerified: true };
        return targetUser;
      }
      return u;
    });

    if (targetUser) {
      this.save(KEYS.USERS, this.users);
      this.addAuditLog(
        admin.id,
        admin.name,
        'VERIFY_USER',
        (targetUser as User).id,
        (targetUser as User).name,
        `Manually confirmed and verified practitioner email (${(targetUser as User).email}).`
      );
      return true;
    }
    return false;
  }

  public getInvoices(userId?: string): PaymentInvoice[] {
    if (userId) {
      return this.invoices.filter((inv) => inv.userId === userId);
    }
    return this.invoices;
  }

  public getPaymentConfig(): DirectPaymentConfig {
    return this.paymentConfig;
  }

  public updatePaymentConfig(config: Partial<DirectPaymentConfig>): DirectPaymentConfig {
    this.paymentConfig = { ...this.paymentConfig, ...config };
    this.save(KEYS.PAYMENT_CONFIG, this.paymentConfig);
    return this.paymentConfig;
  }

  public getInvoiceById(id: string): PaymentInvoice | undefined {
    return this.invoices.find((inv) => inv.id === id);
  }

  public processWebSubscription(
    userId: string,
    payload: WebCheckoutPayload
  ): { success: boolean; invoice: PaymentInvoice } {
    const targetUser = this.users.find((u) => u.id === userId) || this.getCurrentUser();
    const daysValid = payload.billingCycle === 'yearly' ? 365 : 30;
    const expiry = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();
    const amount = payload.billingCycle === 'yearly' ? 19999 : 2499;

    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const last4 = payload.utrNumber
      ? payload.utrNumber.slice(-4)
      : payload.cardNumber
      ? payload.cardNumber.replace(/\s+/g, '').slice(-4)
      : '4242';
    const brand = payload.paymentMethodType === 'card' ? 'Visa' : undefined;

    const newInvoice: PaymentInvoice = {
      id: invoiceId,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      planName: `PsychCare Premium Pro (${payload.billingCycle === 'yearly' ? 'Annual Pass' : 'Monthly Pass'})`,
      billingCycle: payload.billingCycle,
      amount,
      currency: 'INR',
      date: new Date().toISOString(),
      paymentMethod: {
        type: payload.paymentMethodType,
        last4: payload.paymentMethodType === 'card' ? last4 : undefined,
        brand: brand,
        upiId: payload.upiId,
        utrNumber: payload.utrNumber,
      },
      status: 'paid',
    };

    // Update user plan to premium
    this.users = this.users.map((u) => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          plan: 'premium',
          premiumExpiresAt: expiry,
        };
      }
      return u;
    });

    // Save invoice
    this.invoices = [newInvoice, ...this.invoices];
    this.save(KEYS.INVOICES, this.invoices);
    this.save(KEYS.USERS, this.users);

    this.addAuditLog(
      targetUser.id,
      targetUser.name,
      'PAYMENT_SUCCESS',
      targetUser.id,
      targetUser.name,
      `Successfully processed one-time direct payment of ₹${amount.toLocaleString('en-IN')} INR for ${newInvoice.planName} (UTR/Ref: ${payload.utrNumber || 'N/A'}, Invoice: ${invoiceId}).`
    );

    return { success: true, invoice: newInvoice };
  }

  public cancelSubscription(userId: string): boolean {
    const targetUser = this.users.find((u) => u.id === userId);
    if (!targetUser) return false;

    this.users = this.users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          plan: 'free',
          premiumExpiresAt: undefined,
        };
      }
      return u;
    });

    this.save(KEYS.USERS, this.users);

    this.addAuditLog(
      targetUser.id,
      targetUser.name,
      'CANCEL_SUBSCRIPTION',
      targetUser.id,
      targetUser.name,
      'Practitioner cancelled their Premium Pro subscription. Reverted to Free plan.'
    );

    return true;
  }

  public updateUserAvatar(userId: string, avatarUrl: string): boolean {
    let updated = false;
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        updated = true;
        return { ...u, avatarUrl };
      }
      return u;
    });
    if (updated) {
      this.save(KEYS.USERS, this.users);
    }
    return updated;
  }
}

export const storage = new StorageService();
