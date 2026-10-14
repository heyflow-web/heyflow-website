// 구글 시트(Apps Script 웹앱) 호출 도우미. 주소와 비밀키는 환경변수로만 읽는다.
//   GOOGLE_SHEET_WEBHOOK_URL : Apps Script 웹앱 배포 주소
//   ADMIN_API_SECRET        : Apps Script '스크립트 속성'의 ADMIN_API_SECRET과 같은 값
export function webhookUrl() {
  return process.env.GOOGLE_SHEET_WEBHOOK_URL || "";
}

export async function callSheet(action, payload = {}) {
  const url = webhookUrl();
  if (!url) throw new Error("GOOGLE_SHEET_WEBHOOK_URL 환경변수가 없습니다.");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, token: process.env.ADMIN_API_SECRET || "", ...payload }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("시트 스크립트 응답을 읽을 수 없어요. 배포 주소와 권한을 확인해 주세요.");
  }
}
