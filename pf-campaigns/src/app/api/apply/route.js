import { NextResponse } from "next/server";

async function uploadBase64ToCatbox(base64Data, index) {
  try {
    if (!base64Data || typeof base64Data !== "string") return "";
    if (base64Data.startsWith("http")) return base64Data;

    const parts = base64Data.split(",");
    const meta = parts[0];
    const rawBase64 = parts[1] || parts[0];
    const mimeMatch = meta.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = mimeType.split("/")[1] || "jpg";

    const buffer = Buffer.from(rawBase64, "base64");
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    const blob = new Blob([buffer], { type: mimeType });
    formData.append("fileToUpload", blob, `photo_${index + 1}.${ext}`);

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    if (text && text.trim().startsWith("http")) {
      return text.trim();
    }
  } catch (err) {
    console.error("Catbox upload failed:", err);
  }
  return base64Data;
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

    // Convert base64 images to high-speed Catbox permanent CDN URLs
    let uploadedImageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      uploadedImageUrls = await Promise.all(
        images.map((img, idx) => uploadBase64ToCatbox(img, idx))
      );
    }

    const payload = {
      ...body,
      images: uploadedImageUrls,
    };

    console.log("📝 지원서 제출 데이터 받아옴 (Catbox URL 변환 완료):", {
      campaignId,
      campaignTitle,
      name,
      phone,
      blogUrl,
      schedule1,
      schedule2,
      schedule3,
      imageUrls: uploadedImageUrls,
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
