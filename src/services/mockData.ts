import type { User, Client, SessionNote, AssessmentResult, Appointment, AdminAuditLog, PaymentInvoice } from '../types';
import { AVATAR_CHARACTERS } from './avatarCharacters';

const now = new Date();
const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_psy_1',
    name: 'Dr. Sarah Jenkins, PsyD',
    email: 'sarah.jenkins@mindcare.com',
    avatarUrl: AVATAR_CHARACTERS[1].dataUrl, // Calm Fox
    role: 'psychologist',
    plan: 'trial',
    status: 'active',
    emailVerified: true,
    createdAt: tenDaysAgo.toISOString(),
    trialEndsAt: threeDaysLater.toISOString(),
    clinicName: 'Beacon Ridge Psychological Center',
    licenseNumber: 'PSY-89421-CA',
    specialization: 'Cognitive Behavioral Therapy (CBT) & Anxiety',
  },
  {
    id: 'usr_psy_2',
    name: 'Dr. Marcus Vance, PhD',
    email: 'marcus.vance@therapy.org',
    avatarUrl: AVATAR_CHARACTERS[2].dataUrl, // Zen Panda
    role: 'psychologist',
    plan: 'premium',
    status: 'active',
    emailVerified: true,
    createdAt: oneMonthAgo.toISOString(),
    trialEndsAt: oneMonthAgo.toISOString(),
    premiumExpiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    clinicName: 'Vance Neuropsychology Clinic',
    licenseNumber: 'PSY-44109-NY',
    specialization: 'Trauma, EMDR & Mood Disorders',
  },
  {
    id: 'usr_psy_3',
    name: 'Dr. Elena Rostova, PsyD',
    email: 'elena.rostova@clinic.com',
    avatarUrl: AVATAR_CHARACTERS[3].dataUrl, // Kind Koala
    role: 'psychologist',
    plan: 'free',
    status: 'active',
    emailVerified: true,
    createdAt: oneMonthAgo.toISOString(),
    trialEndsAt: oneMonthAgo.toISOString(),
    clinicName: 'Downtown Therapy Practice',
    licenseNumber: 'PSY-11029-TX',
    specialization: 'Family Counseling & Adolescent Health',
  },
  {
    id: 'usr_admin',
    name: 'admin',
    email: 'admin@psychcare.app',
    avatarUrl: AVATAR_CHARACTERS[0].dataUrl, // Dr. Owl
    role: 'admin',
    plan: 'premium',
    status: 'active',
    emailVerified: true,
    createdAt: oneMonthAgo.toISOString(),
    trialEndsAt: threeDaysLater.toISOString(),
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    psychologistId: 'usr_psy_1',
    fullName: 'Alexander Wright',
    age: 34,
    gender: 'Male',
    phone: '+1 (555) 234-8901',
    email: 'alex.wright@example.com',
    emergencyContact: {
      name: 'Claire Wright',
      relationship: 'Spouse',
      phone: '+1 (555) 998-1122',
    },
    riskLevel: 'medium',
    primaryDiagnosis: 'Generalized Anxiety Disorder (F41.1)',
    notesSummary: 'Experiencing severe work burnout and panic attacks triggered by presentation events.',
    createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 6,
    status: 'active',
  },
  {
    id: 'cli_2',
    psychologistId: 'usr_psy_1',
    fullName: 'Hannah Brooks',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 789-0123',
    email: 'hannah.brooks@example.com',
    emergencyContact: {
      name: 'Robert Brooks',
      relationship: 'Father',
      phone: '+1 (555) 443-8877',
    },
    riskLevel: 'high',
    primaryDiagnosis: 'Major Depressive Disorder (F32.1)',
    notesSummary: 'Recent loss of job. Reports persistent low mood, insomnia, and moderate passive ideation.',
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 4,
    status: 'active',
  },
  {
    id: 'cli_3',
    psychologistId: 'usr_psy_1',
    fullName: 'David Miller',
    age: 42,
    gender: 'Male',
    phone: '+1 (555) 671-3329',
    email: 'david.m@example.com',
    emergencyContact: {
      name: 'Jessica Miller',
      relationship: 'Wife',
      phone: '+1 (555) 321-9900',
    },
    riskLevel: 'low',
    primaryDiagnosis: 'Adjustment Disorder (F43.23)',
    notesSummary: 'Adapting to recent relocation and corporate executive promotion.',
    createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 9,
    status: 'active',
  },
  {
    id: 'cli_4',
    psychologistId: 'usr_psy_1',
    fullName: 'Maya Patel',
    age: 22,
    gender: 'Female',
    phone: '+1 (555) 902-1144',
    email: 'maya.p@university.edu',
    emergencyContact: {
      name: 'Sanjay Patel',
      relationship: 'Brother',
      phone: '+1 (555) 662-7711',
    },
    riskLevel: 'medium',
    primaryDiagnosis: 'Social Anxiety Disorder (F40.10)',
    notesSummary: 'College senior navigating career transitions and public speaking anxiety.',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 2,
    status: 'active',
  },
  {
    id: 'cli_5',
    psychologistId: 'usr_psy_2',
    fullName: 'Julian Thorne',
    age: 39,
    gender: 'Male',
    phone: '+1 (555) 310-9988',
    email: 'julian.t@example.com',
    emergencyContact: {
      name: 'Elena Thorne',
      relationship: 'Spouse',
      phone: '+1 (555) 310-9999',
    },
    riskLevel: 'medium',
    primaryDiagnosis: 'Post-Traumatic Stress Disorder (F43.10)',
    notesSummary: 'EMDR trauma processing for vehicle accident recovery.',
    createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 5,
    status: 'active',
  },
  {
    id: 'cli_6',
    psychologistId: 'usr_psy_3',
    fullName: 'Sophia Chen',
    age: 16,
    gender: 'Female',
    phone: '+1 (555) 881-2244',
    email: 'sophia.c@example.com',
    emergencyContact: {
      name: 'Wei Chen',
      relationship: 'Mother',
      phone: '+1 (555) 881-2200',
    },
    riskLevel: 'low',
    primaryDiagnosis: 'Parent-Adolescent Relational Problem (Z62.820)',
    notesSummary: 'Family counseling for academic stress and parent communication.',
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 3,
    status: 'active',
  },
  {
    id: 'cli_admin_1',
    psychologistId: 'usr_admin',
    fullName: 'Jordan Taylor (Admin Test Patient)',
    age: 31,
    gender: 'Non-Binary',
    phone: '+1 (555) 777-8899',
    email: 'jordan.taylor@example.com',
    emergencyContact: {
      name: 'Morgan Taylor',
      relationship: 'Partner',
      phone: '+1 (555) 777-0011',
    },
    riskLevel: 'low',
    primaryDiagnosis: 'Adjustment Disorder with Anxious Mood (F43.22)',
    notesSummary: 'Test patient profile for administrative feature verification and diagnostic tool evaluation.',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastSessionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalSessions: 2,
    status: 'active',
  }
];

export const INITIAL_NOTES: SessionNote[] = [
  {
    id: 'note_1',
    clientId: 'cli_1',
    psychologistId: 'usr_psy_1',
    date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionNumber: 6,
    soap: {
      subjective: 'Client reports improved sleep pattern after implementing sleep hygiene protocol. Still experiences acute heart palpitations prior to weekly management syncs.',
      objective: 'Client appeared attentive and well-groomed. Affect was congruent with reported mild anxiety (5/10). Completed 3 breathing cycles in session.',
      assessment: 'Progressing steadily with CBT exposure exercises. Anxiety symptoms reduced from initial baseline (8/10 down to 5/10). No suicidal ideation.',
      plan: 'Continue weekly CBT. Homework: Maintain worry log and practice box breathing twice daily.',
    },
    dsm5Codes: ['F41.1 Generalized Anxiety Disorder'],
    moodRating: 6,
    isPrivate: false,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note_2',
    clientId: 'cli_2',
    psychologistId: 'usr_psy_1',
    date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionNumber: 4,
    soap: {
      subjective: 'Client stated: "I felt slightly more energy on Tuesday, but Thursday was very heavy." Reports staying in bed for 14 hours on Thursday.',
      objective: 'Psychomotor slowing observed. Speech rate decreased. Eye contact intermittent. Clean appearance.',
      assessment: 'Major Depressive Episode ongoing. High risk of withdrawal. Safety plan reviewed and updated.',
      plan: 'Scheduled follow-up in 4 days. Contacted emergency contact with client consent for check-in protocol.',
    },
    dsm5Codes: ['F32.1 Major Depressive Disorder'],
    moodRating: 3,
    isPrivate: false,
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note_admin_1',
    clientId: 'cli_admin_1',
    psychologistId: 'usr_admin',
    date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionNumber: 2,
    soap: {
      subjective: 'Client reports steady progress with workplace transition and positive response to relaxation drills.',
      objective: 'Client was calm, engaged, and articulate. Mood rated 7/10. Receptive to diagnostic exploration.',
      assessment: 'Adjustment reaction resolving as expected with structured support. No risk factors observed.',
      plan: 'Continue bi-weekly check-ins. Review stress management diary and mindfulness practice.',
    },
    dsm5Codes: ['F43.22 Adjustment Disorder with Anxious Mood'],
    moodRating: 7,
    isPrivate: false,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_ASSESSMENTS: AssessmentResult[] = [
  {
    id: 'ass_1',
    clientId: 'cli_1',
    psychologistId: 'usr_psy_1',
    type: 'GAD-7',
    date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 16,
    maxScore: 21,
    severity: 'Severe Anxiety',
    recommendation: 'Active therapeutic plan, intense anxiety management & specialist consultation.',
    answers: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 1 }
  },
  {
    id: 'ass_2',
    clientId: 'cli_1',
    psychologistId: 'usr_psy_1',
    type: 'GAD-7',
    date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 11,
    maxScore: 21,
    severity: 'Moderate Anxiety',
    recommendation: 'CBT techniques, cognitive restructuring, and periodic review.',
    answers: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1 }
  },
  {
    id: 'ass_3',
    clientId: 'cli_1',
    psychologistId: 'usr_psy_1',
    type: 'GAD-7',
    date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 7,
    maxScore: 21,
    severity: 'Mild Anxiety',
    recommendation: 'Provide stress reduction strategies, mindfulness & watchful waiting.',
    answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }
  },
  {
    id: 'ass_4',
    clientId: 'cli_2',
    psychologistId: 'usr_psy_1',
    type: 'PHQ-9',
    date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 18,
    maxScore: 27,
    severity: 'Moderately Severe Depression',
    recommendation: 'Active psychotherapy and/or pharmacotherapy recommended.',
    answers: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 1, 8: 1, 9: 1 }
  },
  {
    id: 'ass_5',
    clientId: 'cli_2',
    psychologistId: 'usr_psy_1',
    type: 'PHQ-9',
    date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 14,
    maxScore: 27,
    severity: 'Moderate Depression',
    recommendation: 'Consider treatment plan with CBT, psychotherapy or pharmacotherapy.',
    answers: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 1, 8: 1, 9: 1 }
  },
  {
    id: 'ass_admin_1',
    clientId: 'cli_admin_1',
    psychologistId: 'usr_admin',
    type: 'GAD-7',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 10,
    maxScore: 21,
    severity: 'Moderate Anxiety',
    recommendation: 'Targeted relaxation exercises, cognitive reframing, and stress monitoring.',
    answers: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1 }
  },
  {
    id: 'ass_admin_2',
    clientId: 'cli_admin_1',
    psychologistId: 'usr_admin',
    type: 'GAD-7',
    date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalScore: 5,
    maxScore: 21,
    severity: 'Mild Anxiety',
    recommendation: 'Continued maintenance, positive reinforcement, and routine follow-up.',
    answers: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 0 }
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app_1',
    clientId: 'cli_1',
    clientName: 'Alexander Wright',
    psychologistId: 'usr_psy_1',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 50,
    type: 'In-Person',
    status: 'scheduled',
    notes: 'Session 7 - Review worry log and public speaking exposure hierarchy.'
  },
  {
    id: 'app_2',
    clientId: 'cli_2',
    clientName: 'Hannah Brooks',
    psychologistId: 'usr_psy_1',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    durationMinutes: 50,
    type: 'Telehealth',
    status: 'scheduled',
    notes: 'Session 5 - Mood tracking check-in & behavioral activation schedule.'
  },
  {
    id: 'app_3',
    clientId: 'cli_4',
    clientName: 'Maya Patel',
    psychologistId: 'usr_psy_1',
    date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    durationMinutes: 50,
    type: 'Initial Intake',
    status: 'scheduled',
    notes: 'Session 3 - Comprehensive diagnostic intake assessment.'
  },
  {
    id: 'app_admin_1',
    clientId: 'cli_admin_1',
    clientName: 'Jordan Taylor (Admin Test Patient)',
    psychologistId: 'usr_admin',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    durationMinutes: 50,
    type: 'Telehealth',
    status: 'scheduled',
    notes: 'Admin feature verification session - testing calendar scheduling, patient notes, and PDF exports.'
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    adminId: 'usr_admin',
    adminName: 'Admin System Controller',
    action: 'GRANT_PREMIUM',
    targetUserId: 'usr_psy_2',
    targetUserName: 'Dr. Marcus Vance, PhD',
    details: 'Manually granted 1-Year Unrestricted Premium License',
  },
  {
    id: 'log_2',
    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    adminId: 'usr_admin',
    adminName: 'Admin System Controller',
    action: 'EXTEND_TRIAL',
    targetUserId: 'usr_psy_1',
    targetUserName: 'Dr. Sarah Jenkins, PsyD',
    details: 'Extended trial by 3 days upon request',
  }
];

export const INITIAL_INVOICES: PaymentInvoice[] = [
  {
    id: 'INV-2026-0891',
    userId: 'usr_psy_2',
    userName: 'Dr. Marcus Vance, PhD',
    userEmail: 'marcus.vance@therapy.org',
    planName: 'PsychCare Premium Pro (Annual)',
    billingCycle: 'yearly',
    amount: 249,
    currency: 'USD',
    date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa'
    },
    status: 'paid'
  }
];
