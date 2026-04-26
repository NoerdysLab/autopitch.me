import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "warmpitch <onboarding@resend.dev>";

// Internal helper. Soft-fails in dev (so the flow stays exercisable when the
// Resend test sender rejects a recipient), throws in production.
async function deliver(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const isDev = process.env.NODE_ENV !== "production";

  if (!apiKey) {
    if (!isDev) throw new Error("RESEND_API_KEY is not set");
    return;
  }

  try {
    const result = await new Resend(apiKey).emails.send({ from: FROM, ...opts });
    if (result.error) {
      if (isDev) {
        console.warn(`[email] resend rejected: ${result.error.message}`);
        return;
      }
      throw new Error(`Resend send failed: ${result.error.message}`);
    }
  } catch (err) {
    if (isDev) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[email] send error: ${msg}`);
      return;
    }
    throw err;
  }
}

/* ─── OTP ──────────────────────────────────────────────────────────── */

const CODE_TTL_MINUTES = 10;

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  // Always log the code in dev — handy when Resend rejects the test sender's
  // recipient and the email never actually arrives.
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[otp] code for ${email}: ${code}\n`);
  }
  await deliver({
    to: email,
    subject: `Your warmpitch.me sign-in code: ${code}`,
    text: otpText(code),
    html: otpHtml(code),
  });
}

function otpText(code: string): string {
  return `Your warmpitch.me sign-in code is:

${code}

This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.`;
}

function otpHtml(code: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1e;">
  <div style="max-width:480px;margin:0 auto;padding:48px 24px;">
    <div style="font-size:17px;font-weight:600;letter-spacing:-0.01em;margin-bottom:32px;">warmpitch.me</div>
    <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">Your sign-in code</h1>
    <p style="margin:0 0 24px;color:#6b6b73;font-size:15px;line-height:1.5;">Enter this code to finish signing in to warmpitch.me.</p>
    <div style="background:#ffffff;border:1px solid #e8e6e1;border-radius:20px;padding:28px;text-align:center;font-size:32px;font-weight:600;letter-spacing:0.4em;font-variant-numeric:tabular-nums;">${code}</div>
    <p style="margin:24px 0 0;color:#6b6b73;font-size:13px;line-height:1.5;">This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.</p>
  </div>
</body></html>`;
}

/* ─── Welcome ──────────────────────────────────────────────────────── */

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  handle: string;
  takedownUrl: string;
}): Promise<void> {
  await deliver({
    to: opts.to,
    subject: "Your warmpitch.me page is live",
    text: welcomeText(opts),
    html: welcomeHtml(opts),
  });
}

function welcomeText({
  name,
  handle,
  takedownUrl,
}: {
  name: string;
  handle: string;
  takedownUrl: string;
}): string {
  return `Hi ${name.split(/\s+/)[0]},

Your warmpitch.me page is live:

  https://warmpitch.me/${handle}

Share that link anywhere — clicking the buttons opens an AI that already
knows your résumé and pitches you to whoever's listening.

To take your page down at any point in the future, click here (no login needed):

  ${takedownUrl}

Save this email — that takedown link is your kill switch.

— warmpitch.me`;
}

function welcomeHtml({
  name,
  handle,
  takedownUrl,
}: {
  name: string;
  handle: string;
  takedownUrl: string;
}): string {
  const firstName = name.split(/\s+/)[0];
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1e;">
  <div style="max-width:480px;margin:0 auto;padding:48px 24px;">
    <div style="font-size:17px;font-weight:600;letter-spacing:-0.01em;margin-bottom:32px;">warmpitch.me</div>
    <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">Hi ${escapeHtml(firstName)} — your page is live.</h1>
    <p style="margin:0 0 24px;color:#6b6b73;font-size:15px;line-height:1.5;">Share this link anywhere. Clicking the buttons on it opens an AI that already knows your résumé and pitches you to whoever's listening.</p>
    <div style="background:#ffffff;border:1px solid #e8e6e1;border-radius:16px;padding:20px;text-align:center;font-size:18px;font-weight:500;margin-bottom:32px;"><a href="https://warmpitch.me/${handle}" style="color:#1a1a1e;text-decoration:none;">warmpitch.me/${escapeHtml(handle)}</a></div>
    <h2 style="font-size:16px;font-weight:600;margin:0 0 8px;">Need to take it down?</h2>
    <p style="margin:0 0 16px;color:#6b6b73;font-size:14px;line-height:1.5;">Click below to remove your page at any point — no login required. Save this email; the link is your kill switch.</p>
    <p style="margin:0;"><a href="${takedownUrl}" style="display:inline-block;color:#6b6b73;font-size:13px;border-bottom:1px solid #e8e6e1;text-decoration:none;">Take down my page →</a></p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
