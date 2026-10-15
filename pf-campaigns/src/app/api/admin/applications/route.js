import { NextResponse } from "next/server";
import { parseRecruitInfo } from "@/lib/parser";
import { isAdminRequest } from "@/lib/adminAuth";
import { callSheet, webhookUrl } from "@/lib/sheetApi";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1kjwDdMS8AIspbWnDF2ILAlewOA7Dcyp-zk1hE29rbu8/edit?usp=sharing";

export const maxDuration = 60; // 시트가 자동 동기화 중이면 응답이 늦을 수 있어요

const friendlyError = (error) =>
  error && (error.name === "TimeoutError" || error.name === "AbortError" || /abort|timeout/i.test(error.message || ""))
    ? "구글 시트 응답이 늦어요. 자동 동기화 중일 수 있어요. 1분 뒤에 다시 시도해 주세요."
    : error.message;

const unauthorized = () =>
  NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });

// 지원자 목록 + 자동 생성된 문자 (문자발송 탭)
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized();
  if (!webhookUrl()) {
    return NextResponse.json(
      { success: false, error: "GOOGLE_SHEET_WEBHOOK_URL 환경변수가 없습니다." },
      { status: 500 }
    );
  }
  try {
    const json = await callSheet("listApplications");
    if (json.result !== "success" || !Array.isArray(json.rows)) {
      return NextResponse.json(
        { success: false, error: json.message || "시트에서 지원자 목록을 받지 못했어요. 스크립트 배포를 확인해 주세요." },
        { status: 502 }
      );
    }
    const applications = json.rows.map((row) => {
      const parsed = parseRecruitInfo(row.recruitInfo || "", {
        hospital: row.hospital,
        category: row.category,
        name: row.name,
        phone: row.phone,
        birthdate: row.birthdate,
        blogUrl: row.blogUrl,
        treatment: row.treatment,
        schedule1: row.schedule1,
        schedule2: row.schedule2,
        schedule3: row.schedule3,
        imageNote: row.imageNote,
        images: row.images,
        userNote: row.userNote,
      });
      return { ...row, ...parsed, sheetName: row.name, status: row.status || "1.신규지원" };
    });
    return NextResponse.json({
      success: true,
      totalCount: applications.length,
      applications,
      messages: Array.isArray(json.messages) ? json.messages : [],
      sheetUrl: SHEET_URL,
    });
  } catch (error) {
    console.error("Admin applications API error:", error);
    return NextResponse.json({ success: false, error: friendlyError(error) }, { status: 500 });
  }
}

// 수정 요청. 시트 행은 행 번호 + 키(syncKey)로 확인해서, 행이 밀렸으면 거절된다.
export async function POST(request) {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const body = await request.json();
    const { action } = body;
    const allowed = ["updateFields", "setShare", "deleteRow", "markSent", "saveMessage", "renderMessages", "markMessageSent"];
    if (!allowed.includes(action)) {
      return NextResponse.json({ success: false, error: "알 수 없는 요청입니다." }, { status: 400 });
    }
    const { action: _a, ...payload } = body;
    const json = await callSheet(action, payload);
    if (json.result !== "success") {
      return NextResponse.json(
        { success: false, error: json.message || "시트 저장에 실패했어요.", issues: json.issues || [] },
        { status: json.issues ? 422 : 502 }
      );
    }
    return NextResponse.json({ success: true, message: json.message || "", data: json.data || null });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ success: false, error: friendlyError(error) }, { status: 500 });
  }
}
