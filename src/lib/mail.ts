import nodemailer from "nodemailer";

type Purpose = "register" | "reset";

function getConfig() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;
  return {
    from: user,
    transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }),
  };
}

export async function sendOtpEmail(to: string, code: string, purpose: Purpose) {
  const config = getConfig();

  if (!config) {
    // Gmail setup na thakle, development e code ta terminal e dekhai
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[DEV] ${purpose} code for ${to}: ${code}\n`);
      return;
    }
    throw new Error("Email is not configured");
  }

  const title = purpose === "register" ? "Verify your email" : "Reset your password";
  const intro =
    purpose === "register"
      ? "Use this code to finish creating your Apon Bazar account."
      : "Use this code to reset your Apon Bazar password.";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#faf7f2;padding:24px">
    <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #eee">
      <h2 style="margin:0 0 4px;color:#1b5e20">Apon Bazar</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:13px">${title}</p>
      <p style="color:#1f2937;font-size:14px">${intro}</p>
      <div style="margin:20px 0;text-align:center;font-size:34px;font-weight:bold;letter-spacing:10px;color:#2e7d32;background:#e8f5e9;border-radius:12px;padding:16px">${code}</div>
      <p style="color:#6b7280;font-size:12px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  </div>`;

  await config.transporter.sendMail({
    from: `"Apon Bazar" <${config.from}>`,
    to,
    subject: `${code} is your Apon Bazar code`,
    text: `${intro} Your code is ${code}. It expires in 10 minutes.`,
    html,
  });
}