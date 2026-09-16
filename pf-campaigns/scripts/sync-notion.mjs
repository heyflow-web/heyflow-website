import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load environment variables (.env.local or fallback)
dotenv.config({ path: path.resolve(rootDir, ".env.local") });
dotenv.config({ path: path.resolve(rootDir, ".env") });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID =
  process.env.NOTION_CAMPAIGN_DB_ID ||
  process.env.NOTION_DATABASE_ID ||
  "3ddb1670-3d4f-81dd-9379-e97d779fc2cd";

const getPlainText = (prop) => {
  if (!prop) return "";
  if (prop.type === "title") {
    return prop.title?.map((t) => t.plain_text).join("") || "";
  }
  if (prop.type === "rich_text") {
    return prop.rich_text?.map((t) => t.plain_text).join("") || "";
  }
  if (prop.type === "select") {
    return prop.select?.name || "";
  }
  if (prop.type === "number") {
    return prop.number ?? 0;
  }
  return "";
};

const splitLines = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

async function syncNotionCampaigns() {
  console.log("🚀 노션 캠페인 데이터 동기화를 시작합니다...");
  console.log(`📌 Notion DB ID: ${NOTION_DATABASE_ID}`);

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [{ property: "Order", direction: "ascending" }],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Notion API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      console.log("⚠️ Notion 데이터베이스가 비어 있습니다.");
      return;
    }

    const campaigns = results.map((page) => {
      const p = page.properties;

      const id = getPlainText(p.ID);
      const title = getPlainText(p["캠페인명"]);
      const status = getPlainText(p["상태"]) || "모집중";
      const category = getPlainText(p["카테고리"]) || "피부클리닉";
      const location = getPlainText(p["지역"]) || "서울 강남";
      const channel = getPlainText(p["채널"]) || "블로그";
      const offer = getPlainText(p["제공혜택"]);
      const benefitsText = getPlainText(p["혜택상세"]);
      const missionsText = getPlainText(p["리뷰미션"]);
      const conditionsText = getPlainText(p["신청조건"]);
      const noticesText = getPlainText(p["필수유의사항"]);
      const announcement = getPlainText(p["발표일정"]);
      const activity = getPlainText(p["활동일정"]);

      return {
        id: id || page.id,
        status: status,
        category: category,
        title: title,
        location: location,
        channel: channel,
        offer: offer,
        copay: "없음 (전액 무상 지원)",
        visits: "1회 방문",
        description: offer,
        benefits: splitLines(benefitsText),
        missions: splitLines(missionsText),
        conditions: splitLines(conditionsText),
        notices: splitLines(noticesText),
        schedule: {
          announcement: announcement || "신청서 검토 후 순차 개별 연락드립니다.",
          activity: activity || "선정 직후 예약 일정 조율 후 내원 진행합니다.",
        },
      };
    });

    const targetPath = path.resolve(rootDir, "src", "data", "campaigns.json");
    fs.writeFileSync(targetPath, JSON.stringify(campaigns, null, 2), "utf8");

    console.log(`✅ 동기화 완료! 총 ${campaigns.length}개 캠페인이 src/data/campaigns.json에 저장되었습니다.`);
  } catch (error) {
    console.error("❌ 노션 동기화 실패:", error.message);
  }
}

syncNotionCampaigns();
