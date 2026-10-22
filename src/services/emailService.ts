export interface SentEmail {
  id: string;
  to: string;
  toName: string;
  subject: string;
  code: string;
  timestamp: string;
  preview: string;
  body: string;
}

const STORAGE_KEY = 'psychcare_sent_emails_v1';

class EmailService {
  private emails: SentEmail[] = [];

  constructor() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.emails = data ? JSON.parse(data) : [];
    } catch {
      this.emails = [];
    }
  }

  public async sendSecurityCodeEmail(params: {
    toEmail: string;
    toName: string;
    code: string;
  }): Promise<{ success: boolean; message: string }> {
    const body = `Dear ${params.toName},

We received a request to reset the password for your PsychCare clinical workspace account (${params.toEmail}).

Your 6-Digit Security Confirmation Code is:
${params.code}

This confirmation code is valid for 15 minutes.
For your security and HIPAA compliance, never share this code with anyone. PsychCare support will never ask for your security code.

If you did not make this request, you can safely disregard this email or report unauthorized activity to security@psychcare.app.

Sincerely,
PsychCare Security Operations Desk
https://psychcare.app`;

    const newEmail: SentEmail = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      to: params.toEmail,
      toName: params.toName,
      subject: 'PsychCare Security: 6-Digit Password Reset Confirmation Code',
      code: params.code,
      timestamp: new Date().toISOString(),
      preview: `Your 6-digit confirmation code is ${params.code}. Valid for 15 minutes.`,
      body,
    };

    this.emails = [newEmail, ...this.emails].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.emails));
    } catch (e) {
      console.warn('Failed to save email to local storage:', e);
    }

    // Log to browser developer console for traceability
    console.info(
      `%c[PsychCare Email Service] %cEmail dispatched to %c${params.toEmail}%c with Subject: "${newEmail.subject}"`,
      'background:#4f46e5;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px;',
      'color:#94a3b8;',
      'color:#38bdf8;font-weight:bold;',
      'color:#94a3b8;'
    );

    return {
      success: true,
      message: `A 6-digit confirmation code was sent to ${params.toEmail}`,
    };
  }

  public getEmailsFor(email: string): SentEmail[] {
    const normalized = email.trim().toLowerCase();
    return this.emails.filter((m) => m.to.toLowerCase() === normalized);
  }

  public getLatestEmailFor(email: string): SentEmail | undefined {
    return this.getEmailsFor(email)[0];
  }

  public getAllSentEmails(): SentEmail[] {
    return this.emails;
  }
}

export const emailService = new EmailService();
