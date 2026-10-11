export type UserRole = 'psychologist' | 'admin';
export type PlanType = 'trial' | 'free' | 'premium';
export type UserStatus = 'active' | 'banned' | 'pending_verification';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  plan: PlanType;
  status: UserStatus;
  emailVerified?: boolean;
  createdAt: string; // ISO String
  trialEndsAt: string; // ISO String (createdAt + 3 days)
  premiumExpiresAt?: string; // ISO String if premium
  clinicName?: string;
  licenseNumber?: string;
  specialization?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'severe';

export interface Client {
  id: string;
  psychologistId: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  riskLevel: RiskLevel;
  primaryDiagnosis: string;
  notesSummary?: string;
  createdAt: string;
  lastSessionDate?: string;
  totalSessions: number;
  status: 'active' | 'archived';
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface SessionNote {
  id: string;
  clientId: string;
  psychologistId: string;
  date: string;
  sessionNumber: number;
  soap: SoapNote;
  dsm5Codes: string[]; // e.g. ["F41.1 Major Depressive", "F43.10 PTSD"]
  moodRating: number; // 1 to 10 scale
  audioNoteDuration?: string; // e.g. "04:12"
  audioUrl?: string; // Replayable audio recording Data URL / Blob URL
  isAudioRecorded?: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export type AssessmentType = 'PHQ-9' | 'GAD-7' | 'BDI-2';

export interface Question {
  id: number;
  text: string;
  options: { label: string; score: number }[];
}

export interface AssessmentResult {
  id: string;
  clientId: string;
  psychologistId: string;
  type: AssessmentType;
  date: string;
  totalScore: number;
  maxScore: number;
  severity: string;
  recommendation: string;
  answers: Record<number, number>;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  psychologistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: 'In-Person' | 'Telehealth' | 'Initial Intake' | 'Emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId: string;
  targetUserName: string;
  details: string;
}
