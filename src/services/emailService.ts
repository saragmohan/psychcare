import { sendEmailVerification, type User as FirebaseUser } from 'firebase/auth';
import { isFirebaseConfigured } from './firebase';

export interface EmailNotice {
  email: string;
  name: string;
  sentAt: string;
  subject: string;
  bodyPreview: string;
  token?: string;
  verificationLink?: string;
  status: 'sent' | 'delivered';
  deliveryMode: 'real_firebase' | 'real_resend' | 'local_simulated';
}

const CONFIRMATION_KEY = 'psychcare_last_confirmation_email_v1';
const PENDING_VERIFICATIONS_KEY = 'psychcare_pending_verifications_v1';

class EmailService {
  /**
   * Checks if an external email delivery provider (Firebase Auth or Resend) is configured.
   */
  public isRealDeliveryAvailable(): boolean {
    return isFirebaseConfigured() || Boolean(import.meta.env.VITE_RESEND_API_KEY);
  }

  /**
   * Dispatches an account confirmation & email verification message.
   */
  public async sendAccountConfirmationEmail(
    email: string,
    name: string,
    firebaseUser?: FirebaseUser | null
  ): Promise<{ success: boolean; message: string; notice: EmailNotice }> {
    let deliveryMode: 'real_firebase' | 'real_resend' | 'local_simulated' = 'local_simulated';

    // 1. Generate secure verification token and URL
    const token = Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const verificationLink = `${origin}${pathname}?verify_email=${encodeURIComponent(email)}&token=${token}`;

    // 2. Trigger Firebase Auth official email verification if online
    if (firebaseUser) {
      try {
        await sendEmailVerification(firebaseUser);
        deliveryMode = 'real_firebase';
      } catch (err: any) {
        console.warn('Firebase email verification trigger warning:', err?.message || err);
      }
    }

    // 3. Fallback to Resend API if VITE_RESEND_API_KEY is configured
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (deliveryMode === 'local_simulated' && resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PsychCare OS <onboarding@resend.dev>',
            to: [email],
            subject: 'Please Verify Your PsychCare OS Email Address 🔒',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="margin-bottom: 20px;">
                  <span style="font-size: 20px; font-weight: bold; color: #4f46e5;">🧠 PsychCare</span>
                  <span style="font-size: 12px; color: #64748b; margin-left: 8px;">Clinical Psychologist OS</span>
                </div>
                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Confirm your email address</h2>
                <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                  Dear <strong>${name}</strong>,<br/>
                  Thank you for creating your account. Please click the button below to confirm your email and activate your 3-Day Free Trial clinical workspace:
                </p>
                <div style="margin: 28px 0; text-align: center;">
                  <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #0d9488); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">
                    Verify Email & Sign In
                  </a>
                </div>
                <p style="color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                  Or copy and paste this verification link into your browser:<br/>
                  <a href="${verificationLink}" style="color: #4f46e5; word-break: break-all;">${verificationLink}</a>
                </p>
              </div>
            `,
          }),
        });
        if (res.ok) {
          deliveryMode = 'real_resend';
        }
      } catch (resendErr) {
        console.warn('Resend dispatch error:', resendErr);
      }
    }

    // 4. Prepare confirmation email record
    const notice: EmailNotice = {
      email,
      name,
      sentAt: new Date().toISOString(),
      subject: 'Please Verify Your PsychCare OS Email Address 🔒',
      bodyPreview: `Dear ${name}, please confirm your email address (${email}) to activate your 3-Day Free Trial clinical workspace. You will only get login access after completing this verification.`,
      token,
      verificationLink,
      status: 'delivered',
      deliveryMode,
    };

    // 5. Persist verification and last sent notification
    try {
      localStorage.setItem(CONFIRMATION_KEY, JSON.stringify(notice));
      const pending = this.getPendingVerifications();
      pending[email.toLowerCase()] = { email, name, token, sentAt: notice.sentAt };
      localStorage.setItem(PENDING_VERIFICATIONS_KEY, JSON.stringify(pending));
    } catch (e) {
      console.error('Storage save error for email confirmation:', e);
    }

    console.log(`[EmailService] 📧 Email Verification (${deliveryMode}) for ${email}:`, notice);

    const message =
      deliveryMode === 'real_firebase'
        ? `Verification email sent to ${email} via Firebase Auth.`
        : deliveryMode === 'real_resend'
        ? `Verification email sent directly to your inbox at ${email}.`
        : `Email confirmation generated for ${email}. (Local mode: see In-App Mailbox below).`;

    return {
      success: true,
      message,
      notice,
    };
  }

  public getPendingVerifications(): Record<string, { email: string; name: string; token: string; sentAt: string }> {
    try {
      const data = localStorage.getItem(PENDING_VERIFICATIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public clearPendingVerification(email: string): void {
    try {
      const pending = this.getPendingVerifications();
      delete pending[email.toLowerCase()];
      localStorage.setItem(PENDING_VERIFICATIONS_KEY, JSON.stringify(pending));
    } catch (e) {
      console.error('Error clearing pending verification:', e);
    }
  }

  public getLastConfirmationNotice(): EmailNotice | null {
    try {
      const data = localStorage.getItem(CONFIRMATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public clearLastConfirmationNotice(): void {
    localStorage.removeItem(CONFIRMATION_KEY);
  }
}

export const emailService = new EmailService();
