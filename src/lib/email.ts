import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  // For development/debugging
  console.log(`Password reset link for ${email}: ${resetLink}`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
    console.warn('RESEND_API_KEY not set or placeholder. Email not sent.');
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'BookBudddy <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset your BookBudddy password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 60px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(16, 23, 91, 0.05);">
                  <!-- Banner Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #10175b 0%, #283593 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-family: 'Crimson Pro', serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">BookBudddy</h1>
                      <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;">Advanced Study Hub</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; color: #10175b; font-family: 'Crimson Pro', serif; font-size: 24px; font-weight: 700;">Password Reset Request</h2>
                      <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                        Hello, we received a request to reset the password for your BookBudddy account. If this was you, please click the button below to safely create a new password.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="border-radius: 14px; background-color: #10175b;">
                            <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 13px; font-style: italic; text-align: center;">
                        This secure link will expire in 1 hour for your protection.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                        You are receiving this because you requested a password reset.<br>
                        If you didn't expect this, you can safely ignore this email.
                      </p>
                      <p style="margin: 16px 0 0 0; color: #cbd5e1; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                        &copy; ${new Date().getFullYear()} BookBudddy • Scholarly Learning Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendEmailVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  console.log(`Email verification link for ${email}: ${verificationLink}`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'BookBudddy <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify your BookBudddy account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 60px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(16, 23, 91, 0.05);">
                  <!-- Banner Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #10175b 0%, #283593 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-family: 'Crimson Pro', serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">BookBudddy</h1>
                      <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;">Advanced Study Hub</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; color: #10175b; font-family: 'Crimson Pro', serif; font-size: 24px; font-weight: 700;">Welcome to BookBudddy</h2>
                      <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                        Thank you for joining our community of scholars. To complete your registration and activate your account, please click the verification button below.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="border-radius: 14px; background-color: #10175b;">
                            <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;">
                              Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 13px; font-style: italic; text-align: center;">
                        If you didn't create a BookBudddy account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                        Knowledge is the eye of desire and can become the searchlight of the soul.
                      </p>
                      <p style="margin: 16px 0 0 0; color: #cbd5e1; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                        &copy; ${new Date().getFullYear()} BookBudddy • Scholarly Learning Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}
