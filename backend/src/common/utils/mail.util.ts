import * as nodemailer from 'nodemailer';

export class MailUtil {
  private static transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  static async sendMail(options: {
    to: string;
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
  }) {
    const { to, cc, bcc, subject, html } = options;

    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.MAIL_FROM}>`,
      to,
      cc, // Añadimos cc
      bcc, // Añadimos bcc
      subject,
      html,
    });
  }
}
