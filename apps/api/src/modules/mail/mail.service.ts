import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string, tenantName: string) {
    // Generate the reset URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/${tenantName}/auth/reset-password?token=${token}`;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">שחזור סיסמה למערכת CityFix</h2>
        <p>שלום,</p>
        <p>קיבלנו בקשה לאיפוס סיסמה עבור החשבון שלך במערכת CityFix עבור רשות <strong>${tenantName}</strong>.</p>
        <p>אם לא ביקשת לאפס את הסיסמה, ניתן להתעלם ממייל זה.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            אפס סיסמה
          </a>
        </div>
        <p>או העתק והדבק את הקישור הבא בדפדפן שלך:</p>
        <p style="word-break: break-all; color: #666;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          צוות CityFix<br>
          הודעה זו נשלחה אוטומטית, נא לא להשיב למייל זה.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `CityFix <${process.env.SMTP_FROM || 'noreply@cityfix.local'}>`,
        to: email,
        subject: 'CityFix - שחזור סיסמה לחשבונך',
        html,
      });

      this.logger.log(`Password reset email sent to ${email}. Message ID: ${info.messageId}`);
      
      // If using ethereal email for local development, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    }
  }

  async sendStatusUpdateEmail(email: string, issueId: string, newStatus: string, tenantName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/${tenantName}/issues/${issueId}`;

    // Translate status for display
    const statusMap: Record<string, string> = {
      NEW: 'חדש',
      IN_PROGRESS: 'בטיפול',
      RESOLVED: 'טופל',
      CLOSED: 'נסגר',
    };

    const displayStatus = statusMap[newStatus] || newStatus;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">עדכון סטטוס לפנייה ${issueId.slice(-6)}</h2>
        <p>שלום,</p>
        <p>אנו שמחים לעדכן אותך כי הסטטוס של הפנייה שפתחת עודכן ל-<strong>${displayStatus}</strong>.</p>
        <div style="margin: 30px 0;">
          <a href="${issueUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            צפה בפרטי הפנייה
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          צוות CityFix<br>
          הודעה זו נשלחה אוטומטית, נא לא להשיב למייל זה.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `CityFix <${process.env.SMTP_FROM || 'noreply@cityfix.local'}>`,
        to: email,
        subject: `עדכון סטטוס לפנייה: ${displayStatus}`,
        html,
      });

      this.logger.log(`Status update email sent to ${email} for issue ${issueId}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send status update email to ${email}`, error);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, tenantName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/${tenantName}/auth/login`;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">ברוכים הבאים ל-CityFix! 🏙️</h2>
        <p>שלום ${firstName},</p>
        <p>חשבונך נוצר בהצלחה במערכת CityFix עבור רשות <strong>${tenantName}</strong>.</p>
        <p>כעת תוכל/י לדווח על מפגעים, לעקוב אחר פניות ולקבל עדכונים בזמן אמת.</p>
        <div style="margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            כניסה למערכת
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          צוות CityFix<br>
          הודעה זו נשלחה אוטומטית, נא לא להשיב למייל זה.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `CityFix <${process.env.SMTP_FROM || 'noreply@cityfix.local'}>`,
        to: email,
        subject: 'ברוכים הבאים ל-CityFix!',
        html,
      });
      this.logger.log(`Welcome email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }

  async sendIssueCreatedEmail(email: string, reportNumber: string, category: string, tenantName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/${tenantName}/my-reports`;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">הפנייה שלך התקבלה ✅</h2>
        <p>שלום,</p>
        <p>הדיווח שלך בנושא <strong>${category}</strong> התקבל ונרשם במערכת בהצלחה.</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <strong>מספר פנייה:</strong> ${reportNumber}
        </div>
        <p>תוכל/י לעקוב אחר סטטוס הפנייה בכל עת דרך המערכת.</p>
        <div style="margin: 30px 0;">
          <a href="${issueUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            עקוב אחר הפנייה
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          צוות CityFix<br>
          הודעה זו נשלחה אוטומטית, נא לא להשיב למייל זה.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `CityFix <${process.env.SMTP_FROM || 'noreply@cityfix.local'}>`,
        to: email,
        subject: `דיווח ${reportNumber} התקבל בהצלחה`,
        html,
      });
      this.logger.log(`Issue created email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send issue created email to ${email}`, error);
    }
  }
}
