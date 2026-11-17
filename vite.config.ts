import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import nodemailer from 'nodemailer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-send-email',
        configureServer(server) {
          server.middlewares.use('/api/send-email', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { toEmail, toName, code } = data;

                if (!toEmail || !code) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'toEmail and code are required' }));
                  return;
                }

                // 1. Try Resend API if key is configured
                const resendKey = env.VITE_RESEND_API_KEY || env.RESEND_API_KEY;
                if (resendKey) {
                  try {
                    const resp = await fetch('https://api.resend.com/emails', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${resendKey}`,
                      },
                      body: JSON.stringify({
                        from: env.RESEND_FROM || 'PsychCare Security <onboarding@resend.dev>',
                        to: [toEmail],
                        subject: 'PsychCare Security: 6-Digit Password Reset Confirmation Code',
                        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;color:#1e293b;border:1px solid #e2e8f0;border-radius:16px;">
                          <h2 style="color:#4f46e5;margin-top:0;">PsychCare Clinical Workspace</h2>
                          <p>Dear ${toName || 'Practitioner'},</p>
                          <p>We received a request to reset your password. To verify your real identity, please enter this 6-digit confirmation code:</p>
                          <div style="font-size:32px;font-weight:900;letter-spacing:8px;padding:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;text-align:center;color:#0f172a;margin:24px 0;">
                            ${code}
                          </div>
                          <p style="color:#64748b;font-size:13px;line-height:1.5;">This confirmation code expires in 15 minutes. For your security and HIPAA compliance, never share this code with anyone.</p>
                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
                          <p style="color:#94a3b8;font-size:11px;">PsychCare Clinical Practice Operations • Automated Security Alert</p>
                        </div>`,
                      }),
                    });

                    if (resp.ok) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ success: true, provider: 'resend' }));
                      return;
                    } else {
                      const errData = await resp.text();
                      console.error('[Resend Error]', errData);
                    }
                  } catch (err: any) {
                    console.error('[Resend Dispatch Error]', err.message);
                  }
                }

                // 2. Try SMTP (e.g. Gmail App Password or custom SMTP) if configured
                const smtpUser = env.SMTP_USER;
                const smtpPass = env.SMTP_PASS;
                if (smtpUser && smtpPass) {
                  try {
                    const transporter = nodemailer.createTransport({
                      host: env.SMTP_HOST || 'smtp.gmail.com',
                      port: Number(env.SMTP_PORT) || 587,
                      secure: env.SMTP_SECURE === 'true',
                      auth: {
                        user: smtpUser,
                        pass: smtpPass,
                      },
                    });

                    await transporter.sendMail({
                      from: `"PsychCare Security" <${smtpUser}>`,
                      to: toEmail,
                      subject: 'PsychCare Security: 6-Digit Password Reset Confirmation Code',
                      text: `Dear ${toName || 'Practitioner'},\n\nYour 6-digit confirmation code is: ${code}\n\nValid for 15 minutes. Never share this code.`,
                      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;color:#1e293b;border:1px solid #e2e8f0;border-radius:16px;">
                        <h2 style="color:#4f46e5;margin-top:0;">PsychCare Clinical Workspace</h2>
                        <p>Dear ${toName || 'Practitioner'},</p>
                        <p>We received a request to reset your password. To verify your real identity, please enter this 6-digit confirmation code:</p>
                        <div style="font-size:32px;font-weight:900;letter-spacing:8px;padding:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;text-align:center;color:#0f172a;margin:24px 0;">
                          ${code}
                        </div>
                        <p style="color:#64748b;font-size:13px;line-height:1.5;">This confirmation code expires in 15 minutes. For your security and HIPAA compliance, never share this code with anyone.</p>
                        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
                        <p style="color:#94a3b8;font-size:11px;">PsychCare Clinical Practice Operations • Automated Security Alert</p>
                      </div>`,
                    });

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, provider: 'smtp' }));
                    return;
                  } catch (err: any) {
                    console.error('[SMTP Error]', err.message);
                  }
                }

                // 3. Fallback: Log to terminal so developer/admin can see it in terminal logs
                console.info(
                  `\n📩 [PSYCHCARE EMAIL DISPATCH] Recipient: ${toEmail} | Subject: Security Confirmation Code | Code: ${code} (No external SMTP credentials set in .env)\n`
                );

                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    provider: 'local_terminal',
                    needsConfig: !resendKey && !smtpUser,
                    message: `Confirmation code dispatched for ${toEmail}.`,
                  })
                );
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
