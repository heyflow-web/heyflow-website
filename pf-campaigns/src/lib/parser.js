export function parseRecruitInfo(text, rawRow = {}) {
  // rawRow에 이미 개별 컬럼 데이터가 깔끔하게 들어있는 경우 (최신 DB 시트)
  const hasDirectData = rawRow.name || rawRow.phone || rawRow.treatment;
  if (!text || typeof text !== "string" || (hasDirectData && !text.includes("["))) {
    const rawPhone = (rawRow.phone || "").replace(/[^0-9]/g, "");
    let formattedPhone = rawRow.phone || "-";
    if (rawPhone.length === 11) {
      formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3, 7)}-${rawPhone.slice(7)}`;
    } else if (rawPhone.length === 10) {
      formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}`;
    }

    let ageInfo = "";
    if (rawRow.birthdate) {
      const cleanBirth = String(rawRow.birthdate).replace(/[^0-9]/g, "");
      if (cleanBirth.length >= 2) {
        const yearPrefix = cleanBirth.slice(0, 2);
        const currentYear = new Date().getFullYear();
        let birthYear = parseInt(yearPrefix, 10);
        birthYear = birthYear > 30 ? 1900 + birthYear : 2000 + birthYear;
        const age = currentYear - birthYear + 1;
        ageInfo = `${rawRow.birthdate} (${age}세)`;
      }
    }

    let cleanBlogUrl = rawRow.blogUrl || "";
    if (cleanBlogUrl && !cleanBlogUrl.startsWith("http")) {
      cleanBlogUrl = `https://${cleanBlogUrl}`;
    }

    const schedules = [
      rawRow.schedule1,
      rawRow.schedule2,
      rawRow.schedule3,
    ].filter(Boolean);

    const imageUrls = Array.isArray(rawRow.images)
      ? rawRow.images
      : typeof rawRow.images === "string"
      ? rawRow.images.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      rawText: text || "",
      hospital: rawRow.hospital || "병원 미지정",
      category: rawRow.category || "기타",
      name: rawRow.name || "익명 지원자",
      phone: formattedPhone,
      rawPhone: rawPhone,
      birthdate: rawRow.birthdate || "-",
      ageInfo: ageInfo || rawRow.birthdate || "-",
      blogUrl: cleanBlogUrl,
      treatment: rawRow.treatment || "-",
      schedules: schedules.length > 0 ? schedules : ["희망 일정 미기재"],
      schedule1: rawRow.schedule1 || "",
      schedule2: rawRow.schedule2 || "",
      schedule3: rawRow.schedule3 || "",
      imageNote: rawRow.imageNote || "",
      imageUrls: imageUrls,
      userNote: rawRow.userNote || "-",
    };
  }

  const lines = text.split("\n").map((l) => l.trim());

  let hospital = "";
  let category = "";
  let name = "";
  let phone = "";
  let birthdate = "";
  let blogUrl = "";
  let treatment = "";
  let schedule1 = "";
  let schedule2 = "";
  let schedule3 = "";
  let imageNote = "";
  let userNote = "";
  const imageUrls = [];

  let isReadingImages = false;
  let isReadingUserNote = false;
  const userNoteLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // 1. [병원명/카테고리] 형식 파싱
    const headerMatch = line.match(/^\[(.*?)\/(.*?)\]$/);
    if (headerMatch) {
      hospital = headerMatch[1].trim();
      category = headerMatch[2].trim();
      continue;
    }

    // 2. 단일 필드 파싱
    if (line.startsWith("이름 :") || line.startsWith("이름:")) {
      name = line.replace(/^이름\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.startsWith("연락처 :") || line.startsWith("연락처:")) {
      phone = line.replace(/^연락처\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.startsWith("생년월일 :") || line.startsWith("생년월일:")) {
      birthdate = line.replace(/^생년월일\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.startsWith("블로그주소 :") || line.startsWith("블로그주소:")) {
      blogUrl = line.replace(/^블로그주소\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.startsWith("희망시술 :") || line.startsWith("희망시술:")) {
      treatment = line.replace(/^희망시술\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    // 3. 희망예약일자
    if (line.includes("1지망 :") || line.includes("1지망:")) {
      schedule1 = line.replace(/^[-\s]*1지망\s*(?:일정)?\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.includes("2지망 :") || line.includes("2지망:")) {
      schedule2 = line.replace(/^[-\s]*2지망\s*(?:일정)?\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    if (line.includes("3지망 :") || line.includes("3지망:")) {
      schedule3 = line.replace(/^[-\s]*3지망\s*(?:일정)?\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    // 4. 시술부위 상세설명
    if (line.startsWith("시술부위 상세설명 :") || line.startsWith("시술부위 상세설명:")) {
      imageNote = line.replace(/^시술부위\s*상세설명\s*:\s*/, "").trim();
      isReadingImages = false;
      isReadingUserNote = false;
      continue;
    }

    // 5. 첨부사진 URL 블록 감지
    if (line.startsWith("첨부사진URL :") || line.startsWith("첨부사진URL:") || line.startsWith("첨부사진 :")) {
      isReadingImages = true;
      isReadingUserNote = false;
      const inlineUrl = line.replace(/^첨부사진(?:URL)?\s*:\s*/, "").trim();
      if (inlineUrl && (inlineUrl.startsWith("http") || inlineUrl.includes("drive.google"))) {
        imageUrls.push(inlineUrl);
      }
      continue;
    }

    // 6. 특이사항 / 지원동기 블록 감지
    if (line.startsWith("특이사항 :") || line.startsWith("특이사항:") || line.startsWith("지원동기 :") || line.startsWith("지원동기:")) {
      isReadingImages = false;
      isReadingUserNote = true;
      const inlineNote = line.replace(/^(?:특이사항|지원동기)\s*:\s*/, "").trim();
      if (inlineNote) {
        userNoteLines.push(inlineNote);
      }
      continue;
    }

    // 이미지 URL 읽는 중
    if (isReadingImages) {
      if (line.startsWith("http://") || line.startsWith("https://") || line.includes("drive.google.com")) {
        imageUrls.push(line);
      } else if (!line.startsWith("-")) {
        // 다른 필드가 시작되었을 수 있음
        isReadingImages = false;
      }
      continue;
    }

    // 지원동기/특이사항 여러 줄 읽기
    if (isReadingUserNote) {
      userNoteLines.push(line);
      continue;
    }

    // 기타 텍스트 중 드라이브 링크가 포함되어 있다면 사진으로 수집
    if (line.includes("drive.google.com/file/d/")) {
      imageUrls.push(line);
    }
  }

  userNote = userNoteLines.join("\n").trim();

  // 전화번호 하이픈 포맷팅 (01012345678 -> 010-1234-5678)
  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  let formattedPhone = phone;
  if (cleanPhone.length === 11) {
    formattedPhone = `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`;
  } else if (cleanPhone.length === 10) {
    formattedPhone = `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }

  // 나이 계산 (예: 932004 -> 93년생, 010203 -> 01년생 등)
  let ageInfo = "";
  if (birthdate) {
    const cleanBirth = birthdate.replace(/[^0-9]/g, "");
    if (cleanBirth.length >= 2) {
      const yearPrefix = cleanBirth.slice(0, 2);
      const currentYear = new Date().getFullYear();
      let birthYear = parseInt(yearPrefix, 10);
      birthYear = birthYear > 30 ? 1900 + birthYear : 2000 + birthYear;
      const age = currentYear - birthYear + 1; // 한국 나이
      ageInfo = `${birthdate} (${age}세)`;
    }
  }

  // 블로그 URL 정제
  let cleanBlogUrl = blogUrl;
  if (cleanBlogUrl && !cleanBlogUrl.startsWith("http")) {
    cleanBlogUrl = `https://${cleanBlogUrl}`;
  }

  // schedules 배열
  const schedules = [schedule1, schedule2, schedule3].filter(Boolean);

  return {
    rawText: text,
    hospital: hospital || rawRow.hospital || "병원 미지정",
    category: category || rawRow.category || "기타",
    name: name || rawRow.name || "익명 지원자",
    phone: formattedPhone || rawRow.phone || "-",
    rawPhone: cleanPhone,
    birthdate: birthdate || rawRow.birthdate || "-",
    ageInfo: ageInfo || birthdate,
    blogUrl: cleanBlogUrl || rawRow.blogUrl || "",
    treatment: treatment || rawRow.treatment || "-",
    schedules: schedules.length > 0 ? schedules : ["희망 일정 미기재"],
    schedule1: schedule1 || "",
    schedule2: schedule2 || "",
    schedule3: schedule3 || "",
    imageNote: imageNote || rawRow.imageNote || "",
    imageUrls: imageUrls.length > 0 ? imageUrls : (rawRow.images || []),
    userNote: userNote || rawRow.userNote || "-",
  };
}
