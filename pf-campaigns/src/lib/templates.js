// ==========================================
// 문자 및 알림톡 템플릿 관리 & 변수 치환 모듈
// ==========================================

export const DEFAULT_MESSAGE_TEMPLATES = [
  {
    id: "schedule",
    title: "📅 일정 조율",
    content: `[체험단 라운지 - {병원}]
안녕하세요, {이름}님!
신청해주신 '{희망시술}' 체험단에 선정되셨음을 안내드립니다. 🎉

■ 1지망 희망일정: {1지망}
■ 내원 및 시술 진행 일정을 조율하고자 하오니, 본 번호로 편하신 시간대 회신 부탁드립니다.

감사합니다.`,
  },
  {
    id: "confirm",
    title: "✓ 예약 확정",
    content: `[체험단 라운지 - {병원}]
안녕하세요, {이름}님!
신청하신 체험단 예약 일정이 최종 확정되어 안내드립니다.

■ 예약 일시: {예약일}
■ 병원명: {병원}
■ 시술 항목: {희망시술}

※ 예약 시간 10분 전까지 내원 부탁드리며, 일정 변경이 필요하신 경우 최소 3일 전 미리 연락 바랍니다.
감사합니다.`,
  },
  {
    id: "review",
    title: "✍️ 리뷰 안내",
    content: `[체험단 라운지 - {병원}]
안녕하세요, {이름}님!
{병원} 체험은 편안히 잘 받으셨나요?

■ 포스팅 마감: 내원일로부터 7일 이내
■ 안내사항: 전달드린 리뷰 가이드라인에 맞추어 솔직하고 정성스러운 후기 부탁드립니다.
■ 발행 완료 후 포스팅 URL 링크를 본 번호로 회신 부탁드립니다.

감사합니다.`,
  },
];

/**
 * 템플릿 내 변수({이름}, {병원}, {희망시술}, {예약일}, {1지망} 등)를 지원자 실제 정보로 치환
 * {키} 및 [키] 두 가지 포맷을 모두 유연하게 지원합니다.
 */
export function fillTemplatePlaceholders(templateText, applicant) {
  if (!templateText) return "";
  if (!applicant) return templateText;

  const name = applicant.name || "지원자";
  const hospital = applicant.hospital || "체험단 라운지";
  const treatment = applicant.treatment || applicant.campaignTitle || "시술";
  const schedule1 = applicant.schedule1 || (applicant.schedules && applicant.schedules[0]) || "일정 협의";
  const schedule2 = applicant.schedule2 || (applicant.schedules && applicant.schedules[1]) || "";
  const schedule3 = applicant.schedule3 || (applicant.schedules && applicant.schedules[2]) || "";
  const confirmedDate = applicant.confirmedDate || schedule1;
  const phone = applicant.rawPhone || applicant.phone || "";
  const birthdate = applicant.birthdate || "";
  const blogUrl = applicant.blogUrl || "";
  const client = applicant.client || "";
  const guideRoom = applicant.guideRoom || "";
  const draftUrl = applicant.draftUrl || "";
  const postUrl = applicant.postUrl || "";
  const postDate = applicant.postDate || "";
  const keyword = applicant.keyword || "";

  const map = {
    "이름": name,
    "지원자": name,
    "지원자명": name,
    "성함": name,
    "병원": hospital,
    "병원명": hospital,
    "클리닉": hospital,
    "희망시술": treatment,
    "시술": treatment,
    "시술명": treatment,
    "캠페인": treatment,
    "캠페인명": treatment,
    "예약일": confirmedDate,
    "예약일시": confirmedDate,
    "확정일": confirmedDate,
    "확정일시": confirmedDate,
    "확정예약일": confirmedDate,
    "1지망": schedule1,
    "1지망일정": schedule1,
    "희망일정": schedule1,
    "2지망": schedule2,
    "2지망일정": schedule2,
    "3지망": schedule3,
    "3지망일정": schedule3,
    "연락처": phone,
    "전화번호": phone,
    "휴대폰": phone,
    "생년월일": birthdate,
    "블로그": blogUrl,
    "블로그주소": blogUrl,
    "고객사": client,
    "가이드룸": guideRoom,
    "비포애프터": guideRoom,
    "비포앤애프터": guideRoom,
    "원고초안": draftUrl,
    "초안링크": draftUrl,
    "초안": draftUrl,
    "포스팅URL": postUrl,
    "포스팅링크": postUrl,
    "발행링크": postUrl,
    "발행원고": postUrl,
    "원고발행일": postDate,
    "발행일": postDate,
    "키워드": keyword,
    "타겟키워드": keyword,
  };

  let result = templateText;
  for (const [k, v] of Object.entries(map)) {
    const regexCurly = new RegExp(`\\{${k}\\}`, "gi");
    const regexBracket = new RegExp(`\\[${k}\\]`, "gi");
    result = result.replace(regexCurly, v).replace(regexBracket, v);
  }
  return result;
}
