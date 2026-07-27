import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

export class EmailService {
  private createTransport() {
    if (!SMTP_HOST || !SMTP_PORT) {
      return nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      });
    }

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }

  async sendPasswordResetOtp(email: string, otp: string) {
    const transport = this.createTransport();

    await transport.sendMail({
      from: SMTP_FROM || "NutriNepal <no-reply@nutrinepal.local>",
      to: email,
      subject: "Your NutriNepal password reset code",
      text: `Your NutriNepal password reset code is ${otp}. It expires in 10 minutes.`,
    });
  }
}
