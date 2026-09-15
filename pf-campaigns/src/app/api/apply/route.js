import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      campaignId,
      campaignTitle,
      name,
      phone,
      blogUrl,
      schedule1,
      schedule2,
      schedule3,
      agreePrivacy,
      agreeRetention,
      agreeMission,
      agreeMarketing,
    } = body;

    console.log("📝 지원서 제출 데이터 받아옴:", {
      campaignId,
      campaignTitle,
      name,
      phone,
      blogUrl,
      schedule1,
      schedule2,
      schedule3,
    });

    const GOOGLE_SHEET_WEBHOOK_URL =
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbxoP2_WG_P6IsgW1sBxPVDoEdBaRgZlQ7N9pVey-TFQ4SQHWXcnQbusappSYTJZ9soz/exec";

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
        redirect: "follow",
      });

      const responseText = await sheetResponse.text();
      console.log("✅ 구글 시트 전송 결과 status:", sheetResponse.status, "body:", responseText);

      try {
        const parsed = JSON.parse(responseText);
        if (parsed.result === "error") {
          return NextResponse.json(
            { success: false, error: parsed.message || "구글 시트 저장 실패" },
            { status: 500 }
          );
        }
      } catch (e) {
        // Text output might not be JSON, but 200 OK
      }
    }

    return NextResponse.json({
      success: true,
      message: "지원서가 구글 시트로 성공적으로 수집되었습니다.",
    });
  } catch (error) {
    console.error("❌ 지원서 수집 에러:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
