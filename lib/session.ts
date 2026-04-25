import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

// What we store in the encrypted cookie. Two states:
//   pending_email — code requested, not yet verified
//   email         — verified; user is "logged in" (may or may not have a user row yet)
//
// Keeping this minimal — no userId, no roles. Anything beyond email comes
// from a fresh DB lookup so role changes / soft-deletes take effect immediately.
export type Session = {
  pending_email?: string;
  email?: string;
};

function options(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a string of at least 32 characters. See .env.example.",
    );
  }
  return {
    password,
    cookieName: "autopitch_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

export async function getSession() {
  return getIronSession<Session>(await cookies(), options());
}
