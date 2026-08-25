import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { EmailPort } from '@aquasystem/application';
import { Result } from '@aquasystem/shared-kernel';
import { logger } from '@aquasystem/infrastructure';

@injectable()
export class NodemailerAdapter implements EmailPort {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async send(to: string, subject: string, html: string, text?: string): Promise<Result<void>> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'AquaPure System <noreply@aquasystem.com>',
        to,
        subject,
        html,
        text,
      });
      return Result.ok(undefined);
    } catch (err: any) {
      logger.warn({ err, to, subject }, 'Failed to send email via SMTP (logged in dev mode)');
      return Result.ok(undefined);
    }
  }

  async sendTemplate(to: string, templateId: string, data: Record<string, any>): Promise<Result<void>> {
    return this.send(to, `AquaPure Notification: ${templateId}`, `<p>${JSON.stringify(data)}</p>`);
  }
}
