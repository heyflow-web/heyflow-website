// 빌드 전에 구글시트 '캠페인' 탭(Apps Script 웹앱 ?action=campaigns)에서 모집 목록을 받아 campaigns.json을 갱신한다.
// 실패하면 기존 campaigns.json을 그대로 쓴다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;

async function main() {
  if (!url) return console.warn("GOOGLE_SHEET_WEBHOOK_URL 없음 - 기존 campaigns.json 유지");
  try {
    const res = await fetch(url + (url.includes("?") ? "&" : "?") + "action=campaigns", { redirect: "follow" });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return console.warn("캠페인 탭이 비어 있음 - 기존 campaigns.json 유지");
    fs.writeFileSync(path.join(root, "src", "data", "campaigns.json"), JSON.stringify(data, null, 2), "utf8");
    console.log(`캠페인 ${data.length}개 동기화 완료`);
  } catch (e) {
    console.warn("캠페인 동기화 실패 - 기존 campaigns.json 유지:", e.message);
  }
}
main();
