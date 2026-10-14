import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  checkPassword,
  isAdminRequest,
  makeSessionToken,
  sessionCookieOptions,
} from "@/lib/adminAuth";

// 로그인 상태 확인
export async function GET() {
  return NextResponse.json({ authenticated: await isAdminRequest() });
}

// 로그인 (틀리면 잠시 지연시켜 무작정 대입을 늦춘다)
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, makeSessionToken(), sessionCookieOptions);
  return NextResponse.json({ authenticated: true });
}

// 로그아웃
export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ authenticated: false });
}
