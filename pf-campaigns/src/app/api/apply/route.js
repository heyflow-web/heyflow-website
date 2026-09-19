import { NextResponse } from "next/server";

async function uploadBase64ToAnyHost(base64Data, index) {
  if (!base64Data || typeof base64Data !== "string") return "";
  if (base64Data.startsWith("http")) return base64Data;

  const parts = base64Data.split(",");
  const rawBase64 = parts[1] || parts[0];
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const ext = mimeType.split("/")[1] || "jpg";
  const buffer = Buffer.from(rawBase64, "base64");

  // Attempt 1: Litterbox (72 hour direct link)
  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("time", "72h");
    formData.append("fileToUpload", new Blob([buffer], { type: mimeType }), `photo_${index + 1}.${ext}`);
    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    if (text && text.trim().startsWith("http")) {
      return text.trim();
    }
  } catch (e) {
    console.error("Litterbox upload error:", e);
  }

  // Attempt 2: tmpfiles.org
  try {
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: mimeType }), `photo_${index + 1}.${ext}`);
    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.status === "success" && json.data?.url) {
      return json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
    }
  } catch (e) {
    console.error("tmpfiles upload error:", e);
  }

  // Attempt 3: Imgur
  const clientIds = ["54646564070b699", "862d057a6e133c9", "c9a2862d057a6e1"];
  for (const cid of clientIds) {
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
    } catch (e) {
      console.error("Imgur upload error:", e);
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

    // Convert base64 images using 3-tier fallback uploader
    let uploadedImageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      uploadedImageUrls = await Promise.all(
        images.map((img, idx) => uploadBase64ToAnyHost(img, idx))
      );
    }

    const payload = {
      ...body,
      images: uploadedImageUrls.filter((url) => Boolean(url)),
    };

    console.log("📝 지원서 제출 데이터 받아옴 (3단계 이미지 URL 변환 완료):", {
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
      "https://script.google.com/macros/s/AKfycbzjzBC-K9SeElQQYTdwc2dpM9_uX57sG1XU4RHwmpGE2xzTXFwxJolrRylPNV0-fYjb/exec";

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
