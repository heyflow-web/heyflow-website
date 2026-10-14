import crypto from "crypto";
import { cookies } from "next/headers";

// 관리자 로그인 세션 (서버에서만 확인). 비밀번호·서명 키는 환경변수로만 읽는다.
//   ADMIN_PASSWORD : 관리자 비밀번호
//   ADMIN_SESSION_SECRET : (선택) 세션 서명용 키. 없으면 비밀번호에서 만든다.
export const SESSION_COOKIE = "lounge_admin_session";
const SESSION_HOURS = 12;

function signKey() {
  return process.env.ADMIN_SESSION_SECRET || `session:${process.env.ADMIN_PASSWORD || ""}`;
}

function sign(payload) {
  return crypto.createHmac("sha256", signKey()).update(payload).digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false; // 환경변수가 없으면 로그인 불가 (비밀번호를 코드에 두지 않는다)
  return safeEqual(input || "", real);
}

export function makeSessionToken() {
  const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionToken(token) {
  if (!process.env.ADMIN_PASSWORD || !token) return false;
  const [exp, sig] = String(token).split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export async function isAdminRequest() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};
