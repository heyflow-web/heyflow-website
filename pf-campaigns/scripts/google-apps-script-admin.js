// ==========================================
// 체험단 라운지 통합 웹훅 & 관리자 대시보드 연동 스크립트 (통합 버전)
// ==========================================
// 기존 기능(캠페인 목록 조회, 고객사별 드라이브 사진 보관, 접수DB 저장, 알림메일 발송) 100% 유지
// + 신규 기능(관리자 대시보드 실시간 지원자 목록 조회 및 예약확정/상태/메모 동기화)이 안전하게 통합되었습니다.

// 1. GET 요청 처리 (사이트 캠페인 동기화 & 관리자 대시보드 데이터 조회)
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  // [기존 기능] 사이트가 ?action=campaigns 로 부르면 '사이트관리' 탭의 모집 목록을 JSON으로 반환
  if (action === "campaigns") {
    return ContentService
      .createTextOutput(JSON.stringify(readCampaigns_()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // [신규 기능] 관리자 대시보드가 ?action=applications 로 부르면 'DB' 탭의 지원자 목록을 JSON으로 반환
  if (action === "applications" || action === "getAll") {
    return ContentService
      .createTextOutput(JSON.stringify(readApplications_()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 기본 상태 확인 응답
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", message: "체험단 지원서 Webhook 정상 동작 중" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// '사이트관리' 탭에서 캠페인 목록 읽기 (기존 함수 원본 유지)
function readCampaigns_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("사이트관리");
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getDataRange().getValues();
  var h = vals[0].map(function (x) { return String(x).trim(); });
  var col = function (r, n) { var j = h.indexOf(n); return j < 0 ? "" : String(r[j]).trim(); };
  var lines = function (t) { return t ? t.split("\n").map(function (x) { return x.trim(); }).filter(Boolean) : []; };
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    var r = vals[i];
    var status = col(r, "상태");
    if (!col(r, "ID") || status === "숨김") continue; // 상태가 '숨김'이면 사이트에 내보내지 않음
    out.push({
      id: col(r, "ID"),
      status: status || "모집중",
      hospital: col(r, "병원"),
      category: col(r, "카테고리"),
      title: col(r, "캠페인명"),
      location: col(r, "지역") || "서울 강남",
      channel: col(r, "채널") || "블로그",
      offer: col(r, "제공혜택"),
      copay: col(r, "본인부담"),
      visits: col(r, "방문횟수") || "1회 방문",
      description: col(r, "제공혜택"),
      benefits: lines(col(r, "혜택상세")),
      missions: lines(col(r, "리뷰미션")),
      conditions: lines(col(r, "신청조건")),
      notices: lines(col(r, "필수유의사항")),
      schedule: {
        announcement: col(r, "발표일정") || "신청서 검토 후 순차 개별 연락드립니다.",
        activity: col(r, "활동일정") || "선정 직후 예약 일정 조율 후 내원 진행합니다."
      }
    });
  }
  return out;
}

// [신규 기능] 'DB' 탭에서 지원자 전체 목록을 구조화하여 관리자 대시보드로 전달
function readApplications_() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("DB") || ss.getSheetByName("접수DB");
    if (!sh || sh.getLastRow() < 2) {
      return { result: "success", rows: [] };
    }

    var vals = sh.getDataRange().getValues();
    var h = vals[0].map(function (x) { return String(x).trim(); });
    var col = function (r, n) {
      var j = h.indexOf(n);
      return j < 0 ? "" : (r[j] !== undefined && r[j] !== null ? String(r[j]).trim() : "");
    };

    var rows = [];
    for (var i = 1; i < vals.length; i++) {
      var r = vals[i];
      var submittedAt = col(r, "신청일시") || col(r, "일시") || col(r, "접수일시");
      var name = col(r, "이름") || col(r, "지원자") || col(r, "지원자명");
      var phone = col(r, "연락처") || col(r, "전화번호") || col(r, "휴대폰");

      // 빈 행 건너뛰기
      if (!submittedAt && !name && !phone) continue;

      var imgRaw = col(r, "첨부사진링크") || col(r, "첨부사진") || col(r, "사진링크") || col(r, "사진");
      var images = imgRaw ? imgRaw.split("\n").map(function(s){ return s.trim(); }).filter(Boolean) : [];

      rows.push({
        rowId: i + 1,
        submittedAt: submittedAt,
        campaignId: col(r, "캠페인ID"),
        hospital: col(r, "클리닉") || col(r, "병원") || col(r, "병원명"),
        treatment: col(r, "희망시술") || col(r, "캠페인명"),
        category: col(r, "카테고리"),
        name: name,
        birthdate: col(r, "생년월일"),
        phone: phone,
        blogUrl: col(r, "블로그주소") || col(r, "블로그"),
        schedule1: col(r, "1지망") || col(r, "1지망일정"),
        schedule2: col(r, "2지망") || col(r, "2지망일정"),
        schedule3: col(r, "3지망") || col(r, "3지망일정"),
        images: images,
        imageNote: col(r, "시술부위 상세설명") || col(r, "부위설명/특이사항") || col(r, "부위설명"),
        userNote: col(r, "지원동기") || col(r, "특이사항") || col(r, "지원동기/체험소감") || col(r, "체험소감"),
        status: col(r, "진행상태") || "1.신규지원",
        confirmedDate: col(r, "예약일"),
        guideRoom: col(r, "비포앤애프터 이미지") || col(r, "비포앤애프터") || col(r, "비포애프터") || col(r, "가이드룸") || col(r, "블로거폴더") || col(r, "가이드폴더") || col(r, "가이드"),
        draftUrl: col(r, "원고 초안 URL") || col(r, "원고초안") || col(r, "초안 URL") || col(r, "초안링크") || col(r, "초안") || col(r, "검수링크") || col(r, "검수 URL"),
        postDate: col(r, "원고 발행일") || col(r, "발행일") || col(r, "발행일자"),
        keyword: col(r, "타겟 키워드") || col(r, "타겟키워드") || col(r, "키워드"),
        postUrl: col(r, "포스팅URL") || col(r, "포스팅 URL") || col(r, "포스팅링크") || col(r, "발행원고 URL") || col(r, "발행글 URL") || col(r, "발행 URL") || col(r, "발행링크"),
        performance: col(r, "성과") || col(r, "성과지표") || col(r, "성과이미지") || col(r, "포스팅성과"),
        memo: col(r, "이슈") || col(r, "관리자메모") || "",
        client: col(r, "고객사"),
        shareStatus: (function(v) {
          if (!v) return "";
          var s = String(v).trim();
          if (s === "TRUE" || s === "true" || s === "공유됨" || s === "공유완료") return "공유됨";
          if (s === "제외" || s === "FALSE" || s === "false" || s === "미공유") return "";
          return s;
        })(col(r, "공유상태")),
        checkStatus: col(r, "점검"),
        syncKey: col(r, "키"),
        roomSyncVal: col(r, "룸동기값")
      });
    }

    return { result: "success", rows: rows };
  } catch (err) {
    return { result: "error", message: err.toString(), rows: [] };
  }
}

// 체험단 지원서 사진은 고객사별 '02_지원서사진' 폴더에 쌓는다. (고객사 이름 = 병원정보 탭의 '고객사')
var PHOTO_FOLDERS = {
  "살만": "1j7Jlt2LWPkFzbg2wyEvfaxFgGf7sYgSo",
  "큐어람": "1VQihiH2xh_UjIcg5kvT0oOxEbM2VQ9VG"
};
var PHOTO_FOLDER_DEFAULT = "살만"; // 고객사를 못 찾았을 때 쓰는 폴더

// 병원 이름 → 고객사 이름 ('병원정보' 탭의 '시트의 표기' → '고객사'). 접수 알림 메일 제목에 쓴다.
function clientOf_(hospital) {
  var h = String(hospital || "").replace(/\s+/g, "");
  if (!h) return "고객사 미확인";
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("병원정보");
    if (!sh) return "고객사 미확인";
    var rows = sh.getDataRange().getValues().slice(1);
    for (var i = 0; i < rows.length; i++) { // 정확히 같은 표기
      if (String(rows[i][0]).replace(/\s+/g, "") === h && rows[i][4]) return String(rows[i][4]).trim();
    }
    for (var j = 0; j < rows.length; j++) { // 한쪽이 다른 쪽을 포함 (예: '큐어람' / '큐어람한의원')
      var k = String(rows[j][0]).replace(/\s+/g, "");
      if (k && rows[j][4] && (h.indexOf(k) >= 0 || k.indexOf(h) >= 0)) return String(rows[j][4]).trim();
    }
  } catch (err) {
    Logger.log("client lookup err: " + err.toString());
  }
  return "고객사 미확인";
}

// 고객사에 맞는 사진 폴더를 돌려준다. 목록에 없으면 기본 폴더(살만).
function getOrCreateFolder(client) {
  var id = PHOTO_FOLDERS[client] || PHOTO_FOLDERS[PHOTO_FOLDER_DEFAULT];
  if (!PHOTO_FOLDERS[client]) Logger.log("사진 폴더: '" + client + "' 미등록 → 기본 폴더 사용");
  return DriveApp.getFolderById(id);
}

// 2. POST 요청 처리 (지원서 접수 & 관리자 상태 업데이트)
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // [신규 기능] 관리자 대시보드에서 보낸 상태/예약일/메모 업데이트 요청 처리
    if (data && data.action === "updateStatus") {
      return handleUpdateStatus_(data);
    }

    // [신규 기능] 관리자 대시보드에서 보낸 지원서 행 삭제 요청 처리
    if (data && data.action === "deleteRow") {
      return handleDeleteRow_(data);
    }

    // --- 이하 기존 신규 지원서 접수 처리 로직 (100% 원본 유지) ---
    // 1. 현재 시트에서 "DB" 탭 가져오기 (예전 이름 "접수DB"도 인식, 없으면 자동 생성)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("DB") || ss.getSheetByName("접수DB");
    if (!sheet) {
      sheet = ss.insertSheet("DB");
    }

    var now = new Date();
    var dateString = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    // 2. 첨부 사진을 구글 드라이브에 저장하고 링크 추출
    var finalImageUrls = [];
    var rawImages = data.rawImages || data.images || [];
    var folder = null;
    try {
      folder = getOrCreateFolder(clientOf_(data.hospital));
    } catch (fErr) {
      Logger.log("Folder access err: " + fErr.toString());
    }

    var driveNameBase = data.driveFileName || (data.name + "_" + (data.campaignId || "캠페인"));

    for (var i = 0; i < rawImages.length; i++) {
      var driveUrl = "";
      var fileName = driveNameBase + "_사진" + (i + 1) + ".jpg";

      if (folder && rawImages[i] && typeof rawImages[i] === "string" && rawImages[i].indexOf("data:image") === 0) {
        try {
          var parts = rawImages[i].split(",");
          var contentType = (parts[0].match(/:(.*?);/) || [])[1] || "image/jpeg";
          var base64 = parts[1];
          var blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fileName);
          var file = folder.createFile(blob);
          driveUrl = file.getUrl();
        } catch (e1) {
          Logger.log("Drive save err: " + e1.toString());
        }
      }

      if (driveUrl) {
        finalImageUrls.push(driveUrl);
      }
    }

    var imagesString = finalImageUrls.join("\n");

    // 3. 컬럼 헤더 자동 인식 및 데이터 매핑
    var headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // 만약 시트가 완전히 비어있다면 기본 헤더 자동 생성
    if (headers.length === 0 || !headers[0]) {
      headers = [
        "신청일시", "캠페인ID", "클리닉", "희망시술", "카테고리",
        "이름", "생년월일", "연락처", "블로그주소",
        "블로그지수", "1지망", "2지망", "3지망",
        "개인정보동의", "6개월유지동의", "미션수행동의", "마케팅동의", "일정변경불가동의",
        "첨부사진링크", "시술부위 상세설명", "지원동기",
        "공유상태", "점검", "고객사", "모집정보(원문)", "키",
        "진행상태", "예약일", "원고 발행일", "키워드", "발행원고 URL", "성과", "이슈", "룸동기값"
      ];
      sheet.appendRow(headers);
    }

    // 각 헤더명에 대응하는 데이터 매핑 사전
    var fieldMap = {
      "신청일시": dateString,
      "일시": dateString,
      "접수일시": dateString,
      "캠페인ID": data.campaignId || "",
      "캠페인명": data.campaignTitle || "",
      "병원": data.hospital || "",
      "병원명": data.hospital || "",
      "클리닉": data.hospital || "",
      "희망시술": data.campaignTitle || "",
      "카테고리": data.category || "",
      "이름": data.name || "",
      "지원자": data.name || "",
      "지원자명": data.name || "",
      "생년월일": data.birthdate || "",
      "연락처": data.phone || "",
      "전화번호": data.phone || "",
      "휴대폰": data.phone || "",
      "블로그": data.blogUrl || "",
      "블로그주소": data.blogUrl || "",
      "1지망일정": data.schedule1 || "",
      "1지망": data.schedule1 || "",
      "2지망일정": data.schedule2 || "",
      "2지망": data.schedule2 || "",
      "3지망일정": data.schedule3 || "",
      "3지망": data.schedule3 || "",
      "개인정보동의": data.agreePrivacy ? "동의" : "미동의",
      "6개월유지동의": data.agreeRetention ? "동의" : "미동의",
      "유지동의": data.agreeRetention ? "동의" : "미동의",
      "미션수행동의": data.agreeMission ? "동의" : "미동의",
      "미션동의": data.agreeMission ? "동의" : "미동의",
      "마케팅동의": data.agreeMarketing ? "동의" : "미동의",
      "일정변경불가동의": data.agreeNoChange ? "동의" : "미동의",
      "일정변경동의": data.agreeNoChange ? "동의" : "미동의",
      "첨부사진링크": imagesString,
      "첨부사진": imagesString,
      "사진": imagesString,
      "사진링크": imagesString,
      "부위설명/특이사항": data.imageNote || "",
      "부위설명": data.imageNote || "",
      "시술부위 상세설명": data.imageNote || "",
      "특이사항": data.userNote || "",
      "지원동기": data.userNote || "",
      "지원동기/체험소감": data.userNote || "",
      "체험소감": data.userNote || "",
      "진행상태": data.status || "1.신규지원",
      "공유상태": data.shareStatus || "미공유"
    };

    var rowData = [];
    for (var k = 0; k < headers.length; k++) {
      var colHeader = String(headers[k]).trim();
      rowData.push(fieldMap[colHeader] !== undefined ? fieldMap[colHeader] : "");
    }
    sheet.appendRow(rowData);

    // 연락처·생년월일은 문자로 다시 써서 앞자리 0이 사라지지 않게 한다
    var newRow = sheet.getLastRow();
    for (var c = 0; c < headers.length; c++) {
      var hn = String(headers[c]).trim();
      if (hn === "연락처" || hn === "전화번호" || hn === "휴대폰" || hn === "생년월일" || hn === "신청일시") {
        var cell = sheet.getRange(newRow, c + 1);
        cell.setNumberFormat("@");
        cell.setValue(String(rowData[c]));
      }
    }

    // 4. 관리자 알림 이메일 발송
    var emailRecipients = ["gkt0108@gmail.com", "team.archivehey@gmail.com"];
    var emailSubject = "[🍊체험단 지원자] " + clientOf_(data.hospital) + " / " + (data.hospital || "병원 미확인") + " 지원자 등장 📩";

    var emailBodyHtml = "<h3>체험단 지원서 접수 알림</h3>" +
      "<p><b>신청일시 :</b> " + dateString + "</p>" +
      "<p><b>병원명 :</b> " + (data.hospital || "-") + "</p>" +
      "<p><b>캠페인명 :</b> " + (data.campaignTitle || "-") + "</p>" +
      "<p><b>이름 :</b> " + (data.name || "") + "</p>" +
      "<p><b>연락처 :</b> " + (data.phone || "") + "</p>" +
      "<p><b>생년월일 :</b> " + (data.birthdate || "-") + "</p>" +
      "<p><b>블로그주소 :</b> <a href='" + (data.blogUrl || "") + "'>" + (data.blogUrl || "") + "</a></p>" +
      "<p><b>1지망 일정 :</b> " + (data.schedule1 || "") + "</p>" +
      "<p><b>2지망 일정 :</b> " + (data.schedule2 || "") + "</p>" +
      "<p><b>3지망 일정 :</b> " + (data.schedule3 || "") + "</p>" +
      "<p><b>첨부사진 (구글 드라이브 링크) :</b><br>" + (imagesString ? imagesString.split("\n").map(function(url){ return "<a href='" + url + "' target='_blank'>" + url + "</a>"; }).join("<br>") : "없음") + "</p>" +
      "<p><b>시술부위 상세설명 :</b> " + (data.imageNote || "-") + "</p>" +
      "<p><b>지원동기 :</b> " + (data.userNote || "-") + "</p>";

    for (var j = 0; j < emailRecipients.length; j++) {
      try {
        MailApp.sendEmail({
          to: emailRecipients[j],
          subject: emailSubject,
          htmlBody: emailBodyHtml
        });
      } catch (e) {
        Logger.log("Email send error: " + e.toString());
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", message: "구글 시트 저장 및 드라이브 보관 완료" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// [신규 기능] 관리자 상태/예약일/이슈(메모) 업데이트 처리
function handleUpdateStatus_(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("DB") || ss.getSheetByName("접수DB");
    if (!sh) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "DB 탭을 찾을 수 없습니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var targetRow = parseInt(data.rowId, 10);
    if (!targetRow || targetRow < 2 || targetRow > sh.getLastRow()) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "유효하지 않은 행 번호입니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (x) { return String(x).trim(); });

    var setVal = function(colName, value) {
      var idx = headers.indexOf(colName);
      if (idx >= 0 && value !== undefined) {
        sh.getRange(targetRow, idx + 1).setValue(String(value));
      }
    };

    var setAny = function(colCandidates, value) {
      if (value === undefined) return;
      for (var ci = 0; ci < colCandidates.length; ci++) {
        var idx = headers.indexOf(colCandidates[ci]);
        if (idx >= 0) {
          sh.getRange(targetRow, idx + 1).setValue(String(value));
          return;
        }
      }
    };

    if (data.status !== undefined) setVal("진행상태", data.status);
    if (data.confirmedDate !== undefined) setVal("예약일", data.confirmedDate);
    if (data.guideRoom !== undefined) setAny(["비포앤애프터 이미지", "비포앤애프터", "비포애프터", "가이드룸", "블로거폴더", "가이드폴더", "가이드"], data.guideRoom);
    if (data.draftUrl !== undefined) setAny(["원고초안", "원고 초안 URL", "초안", "초안링크", "초안 URL", "검수링크", "검수 URL"], data.draftUrl);
    if (data.postDate !== undefined) setAny(["원고 발행일", "발행일", "발행일자"], data.postDate);
    if (data.postUrl !== undefined) setAny(["포스팅URL", "포스팅 URL", "포스팅링크", "발행원고 URL", "발행글 URL", "발행 URL", "발행링크"], data.postUrl);
    if (data.keyword !== undefined) setAny(["타겟 키워드", "타겟키워드", "키워드"], data.keyword);
    if (data.performance !== undefined) setAny(["성과", "성과지표", "성과이미지", "포스팅성과"], data.performance);
    if (data.shareStatus !== undefined) {
      var sVal = data.shareStatus;
      if (sVal === true || sVal === "true" || sVal === "TRUE" || sVal === "공유됨") {
        sVal = "공유됨";
      } else if (sVal === false || sVal === "false" || sVal === "FALSE" || sVal === "제외" || !sVal) {
        sVal = "";
      }
      setVal("공유상태", sVal);
    }
    if (data.memo !== undefined) {
      setAny(["이슈", "관리자메모"], data.memo);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", message: "상태 업데이트 완료" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// [신규 기능] 관리자 지원서 행 삭제 처리
function handleDeleteRow_(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("DB") || ss.getSheetByName("접수DB");
    if (!sh) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "DB 탭을 찾을 수 없습니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var targetRow = parseInt(data.rowId, 10);
    if (!targetRow || targetRow < 2 || targetRow > sh.getLastRow()) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "유효하지 않은 행 번호입니다." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sh.deleteRow(targetRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", message: targetRow + "행 지원서 삭제 완료" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 📌 권한 승인 및 드라이브 폴더 생성 확인용 함수 (기존 원본 유지)
function authorizeEverything() {
  Object.keys(PHOTO_FOLDERS).forEach(function (c) {
    Logger.log("📁 1. " + c + " 사진 폴더 연결 성공: " + getOrCreateFolder(c).getName());
  });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DB") || ss.getSheetByName("접수DB") || ss.insertSheet("DB");
  Logger.log("📊 2. 시트 'DB' 탭 연결 성공: " + sheet.getName());
}
