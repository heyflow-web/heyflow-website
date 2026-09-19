import { NextResponse } from "next/server";

const IMGUR_CLIENT_IDS = [
  "54646564070b699",
  "862d057a6e133c9",
  "c9a2862d057a6e1",
  "9f3442c3e5d3fc3",
  "c9a35e808fa7a76",
];

async function uploadBase64ToImgur(base64Data) {
  if (!base64Data || typeof base64Data !== "string") return "";
  if (base64Data.startsWith("http")) return base64Data;

  const parts = base64Data.split(",");
  const rawBase64 = parts[1] || parts[0];

  for (const cid of IMGUR_CLIENT_IDS) {
    try {
      const params = new URLSearchParams();
      params.append("image", rawBase64);
      params.append("type", "base64");

      const res = await fetch("https://api.imgur.com/3/upload", {
        method: "POST",
        headers: { Authorization: `Client-ID ${cid}` },
        body: params,
      });

      const json = await res.json();
      if (json.status === 200 && json.data?.link) {
        return json.data.link;
      }
    } catch (err) {
      console.error("Imgur upload failed:", err);
    }
  }
  return "";
}

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
      images,
      imageNote,
      userNote,
      agreePrivacy,
      agreeRetention,
      agreeMission,
      agreeMarketing,
    } = body;

    // Convert base64 images to permanent Imgur CDN URLs
    let uploadedImageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      uploadedImageUrls = await Promise.all(
        images.map((img) => uploadBase64ToImgur(img))
      );
    }

    const payload = {
      ...body,
      images: uploadedImageUrls.filter((url) => Boolean(url)),
    };

    console.log("📝 지원서 제출 데이터 받아옴 (Imgur URL 변환 완료):", {
      campaignId,
      campaignTitle,
      name,
      phone,
      blogUrl,
      schedule1,
      schedule2,
      schedule3,
      imageUrls: payload.images,
      imageNote,
      userNote,
    });

    const GOOGLE_SHEET_WEBHOOK_URL =
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbypC9lQGqYRLfmgtMFPPPnziPcdBOl58pyMlTRh_1GAXSEYf3mAj-iNoK9d9wreAFqI/exec";

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
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
