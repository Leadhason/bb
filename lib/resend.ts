import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("⚠️  RESEND_API_KEY is not configured in environment variables.");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;
